#!/usr/bin/env python3
"""
Reescribe content-generator.json con la arquitectura definitiva:
  - Ideogram genera SOLO la escena visual (sin texto)
  - Sharp + SVG componen el texto programáticamente
  - Se elimina el bucle de OCR/retry (la composición es determinista)

Lee:
  - content-generator.json  (workflow original)
  - lib/compose-image.js    (código del Code node "Componer imagen final")
  - lib/auditor-system-prompt.md  (system prompt del Auditor)

Escribe:
  - content-generator.json  (in-place)
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKFLOW = ROOT / "content-generator.json"
COMPOSE_JS = ROOT / "lib" / "compose-image.js"
AUDITOR_MD = ROOT / "lib" / "auditor-system-prompt.md"


def load_compose_js() -> str:
    return COMPOSE_JS.read_text(encoding="utf-8")


def load_auditor_system_prompt() -> str:
    md = AUDITOR_MD.read_text(encoding="utf-8")
    # Extraer el primer bloque ``` después de "## System prompt"
    m = re.search(r"## System prompt\s*\n+```\s*\n(.*?)\n```", md, re.S)
    if not m:
        raise RuntimeError("No se encontró bloque ``` después de '## System prompt' en auditor-system-prompt.md")
    return m.group(1).strip()


def find_node(wf, node_id):
    for n in wf["nodes"]:
        if n.get("id") == node_id:
            return n
    return None


def remove_nodes(wf, node_ids):
    keep = []
    removed_names = set()
    for n in wf["nodes"]:
        if n.get("id") in node_ids:
            removed_names.add(n["name"])
            continue
        keep.append(n)
    wf["nodes"] = keep
    # Quitar las conexiones de y hacia los nodos removidos
    new_conns = {}
    for src, outs in wf.get("connections", {}).items():
        if src in removed_names:
            continue
        new_outs = {"main": []}
        for branch in outs.get("main", []):
            if branch is None:
                new_outs["main"].append(None)
                continue
            new_branch = [c for c in branch if c.get("node") not in removed_names]
            new_outs["main"].append(new_branch)
        new_conns[src] = new_outs
    wf["connections"] = new_conns


def set_connection(wf, src_name, dst_name, src_index=0):
    """Asegura que src_name[src_index] → dst_name (reemplaza el array de salida en ese index)."""
    conns = wf.setdefault("connections", {})
    outs = conns.setdefault(src_name, {"main": []})
    main = outs["main"]
    while len(main) <= src_index:
        main.append([])
    main[src_index] = [{"node": dst_name, "type": "main", "index": 0}]


def rename_node(wf, node_id, new_name):
    """Renombra un nodo por id y actualiza todas las conexiones que lo referencian."""
    node = find_node(wf, node_id)
    if not node:
        raise RuntimeError(f"Nodo {node_id} no encontrado")
    old_name = node["name"]
    if old_name == new_name:
        return
    node["name"] = new_name
    conns = wf.get("connections", {})
    # Reemplazar como source (key del dict)
    if old_name in conns:
        conns[new_name] = conns.pop(old_name)
    # Reemplazar como destination (dentro de los arrays)
    for src, outs in conns.items():
        for branch in outs.get("main", []):
            if not branch:
                continue
            for c in branch:
                if c.get("node") == old_name:
                    c["node"] = new_name


def main():
    wf = json.loads(WORKFLOW.read_text(encoding="utf-8"))

    # ─── 1. Actualizar nombre del workflow ────────────────────────────
    wf["name"] = "Content Generator — Ideogram + Sharp Compose → Telegram"

    # ─── 2. Refactor del Auditor: nuevo system prompt en inglés ───────
    auditor = find_node(wf, "http-prompt-auditor")
    if not auditor:
        raise RuntimeError("Nodo http-prompt-auditor no encontrado")

    system_prompt = load_auditor_system_prompt()
    # Expresión JS completa con concatenación: comienza y termina con comilla simple equilibrada.
    user_expr = (
        "'Plataforma: ' + $json.platform"
        " + '\\nFormato: ' + $json.format"
        " + '\\nPilar: ' + $json.pillar"
        " + '\\nTipo: ' + $json.post_type"
        " + '\\nCopy del post (en español, NO incluir en la imagen): ' + $json.copy_text"
        " + '\\nIdea base: ' + $json.image_prompt"
    )

    # Construir el jsonBody literal de n8n
    body_obj = {
        "model": "gpt-4o-mini",
        "temperature": 0.8,
        "max_tokens": 600,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "__USER_EXPR__"},
        ],
    }
    body_json = json.dumps(body_obj, ensure_ascii=False)
    # Reemplazar el placeholder (string JSON con comillas dobles) por la expresión JS
    body_expr = body_json.replace('"__USER_EXPR__"', user_expr)
    auditor["parameters"]["jsonBody"] = "={{ JSON.stringify(" + body_expr + ") }}"

    # ─── 3. Refactor Ideogram: V_2_TURBO + magic AUTO + negative_prompt ─
    rename_node(wf, "http-stability", "Ideogram — generar imagen (sin texto)")
    ideogram = find_node(wf, "http-stability")
    ideogram["parameters"]["jsonBody"] = (
        "={{ JSON.stringify({ image_request: { "
        "prompt: $json.image_prompt, "
        "aspect_ratio: $json.aspect_ratio, "
        "model: 'V_2_TURBO', "
        "magic_prompt_option: 'AUTO', "
        "negative_prompt: 'text, letters, numbers, words, watermark, logo, caption, label, sign, typography, readable text, signage, signature, written language' "
        "} }) }}"
    )

    # ─── 4. Reemplazar "Guardar imagen en disco" por composición Sharp ─
    rename_node(wf, "code-save-image", "Componer imagen final (Sharp + SVG)")
    compose = find_node(wf, "code-save-image")
    compose["parameters"]["jsCode"] = load_compose_js()

    # ─── 5. Eliminar nodos OCR + retry (ya no son necesarios) ─────────
    to_remove = {
        "http-vision-ocr",
        "code-validate-ocr",
        "if-ocr-passed",
        "if-can-retry",
        "postgres-retry",
        "postgres-error",
    }
    remove_nodes(wf, to_remove)

    # ─── 6. Reescribir conexiones del tramo composición → telegram ────
    # Componer imagen final → Guardar image_path → status = review → Preparar binario Telegram → Telegram → Guardar telegram_msg_id
    set_connection(wf, "Componer imagen final (Sharp + SVG)", "Guardar image_path")
    set_connection(wf, "Guardar image_path", "status = review")
    # "status = review" ya conecta a "Preparar binario Telegram" en el original

    # Renombrar referencia: el nodo "Preparar binario Telegram" usa $('Validar OCR') que ya no existe
    prep = find_node(wf, "code-prep-telegram")
    if prep:
        # Cambiar referencia de $('Validar OCR') a $('Componer imagen final (Sharp + SVG)')
        old = "$('Validar OCR')"
        new = "$('Componer imagen final (Sharp + SVG)')"
        prep["parameters"]["jsCode"] = prep["parameters"]["jsCode"].replace(old, new)

    # Mismo en "Guardar telegram_msg_id"
    save_tg = find_node(wf, "postgres-set-telegram-id")
    if save_tg:
        old = "$('Validar OCR')"
        new = "$('Componer imagen final (Sharp + SVG)')"
        save_tg["parameters"]["query"] = save_tg["parameters"]["query"].replace(old, new)

    # ─── 7. Guardar ───────────────────────────────────────────────────
    WORKFLOW.write_text(
        json.dumps(wf, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"OK: {WORKFLOW} reescrito.")
    print(f"  Nodos: {len(wf['nodes'])}")
    print(f"  Conexiones: {len(wf['connections'])}")


if __name__ == "__main__":
    main()
