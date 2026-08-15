#!/usr/bin/env python3
"""
Sincroniza el código fuente de los Code nodes (en lib/*.js) hacia content-generator.json.

Fuente de verdad: los archivos lib/*.js de este mapa.
El JSON de n8n es un artefacto generado; el código se edita en lib/ y se inyecta aquí.

Uso:
    python lib/sync-node-code.py            # inyecta y guarda
    python lib/sync-node-code.py --check    # solo verifica que estén en sync (exit 1 si no)

Reemplaza al obsoleto build-content-generator.py, que apuntaba a nodos
(http-stability, http-vision-ocr, code-validate-ocr...) que ya no existen.
"""
import json
import sys
from pathlib import Path

LIB = Path(__file__).resolve().parent
WORKFLOW = LIB.parent / "content-generator.json"

# node id en el JSON  ->  archivo .js fuente en lib/
NODE_CODE_MAP = {
    "code-ideogram-ocr": LIB / "ideogram-ocr.js",
    "code-prep-auditor-prompt": LIB / "prep-auditor-prompt.js",
    "code-monitor-alert-text": LIB / "monitor-alert-text.js",
}


def load_workflow():
    return json.loads(WORKFLOW.read_text(encoding="utf-8"))


def find_node(wf, node_id):
    for n in wf["nodes"]:
        if n.get("id") == node_id:
            return n
    return None


def main():
    check_only = "--check" in sys.argv
    wf = load_workflow()

    out_of_sync = []
    for node_id, js_path in NODE_CODE_MAP.items():
        node = find_node(wf, node_id)
        if not node:
            raise RuntimeError(f"Nodo {node_id} no encontrado en {WORKFLOW.name}")
        code = js_path.read_text(encoding="utf-8")
        current = node["parameters"].get("jsCode", "")
        if current.strip() != code.strip():
            out_of_sync.append(node_id)
            if not check_only:
                node["parameters"]["jsCode"] = code

    if check_only:
        if out_of_sync:
            print("OUT OF SYNC:", ", ".join(out_of_sync))
            sys.exit(1)
        print("OK: todos los Code nodes están en sync con lib/")
        return

    if out_of_sync:
        WORKFLOW.write_text(
            json.dumps(wf, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"OK: {WORKFLOW.name} actualizado. Nodos sincronizados: {', '.join(out_of_sync)}")
    else:
        print("OK: nada que actualizar (ya estaba en sync).")


if __name__ == "__main__":
    main()
