#!/usr/bin/env python3
# deploy/scripts/insert-content-plan.py
# A4 usa este script para agregar posts al plan de contenido.
# Uso: python3 insert-content-plan.py --date 2026-06-02 --platform linkedin ...

import argparse
import os
import sys
import uuid
import psycopg2

DB_URL = os.environ.get("DATABASE_URL")
if not DB_URL:
    print("ERROR: DATABASE_URL no definida en el entorno")
    sys.exit(1)

VALID_PLATFORMS = ("linkedin", "instagram", "facebook", "meta")
VALID_FORMATS   = ("imagen_copy", "carrusel", "texto_largo", "reel")
VALID_PILLARS   = ("educacion", "casos_de_uso", "prueba_social", "behind_the_scenes")
VALID_TYPES     = ("valor", "conversion")

# Destino de conversión: el sitio es one-page, el diagnóstico vive en #contacto.
# UTMs ANTES del fragment '#' (lo posterior al '#' no llega al servidor/GA).
SITE_BASE = "https://jaagsolutions.com/"
DIAG_ANCHOR = "#contacto"
HARD_CTA = "👉 Agenda tu diagnóstico gratuito de 10 minutos."


def build_cta_url(platform, pillar, post_type, date):
    """cta_url con UTMs. Conversión apunta a #contacto; valor a la home."""
    qs = (
        f"?utm_source={platform}&utm_medium=social"
        f"&utm_campaign={pillar}"
        f"&utm_content={date.replace('-', '')}"
        f"&utm_term={post_type}"
    )
    anchor = DIAG_ANCHOR if post_type == "conversion" else ""
    return SITE_BASE + qs + anchor

def main():
    p = argparse.ArgumentParser(description="Insertar post en content_plan")
    p.add_argument("--date",     required=True,  help="YYYY-MM-DD")
    p.add_argument("--time",     default="10:00", help="HH:MM (default: 10:00)")
    p.add_argument("--platform", required=True,  choices=VALID_PLATFORMS)
    p.add_argument("--format",   required=True,  choices=VALID_FORMATS)
    p.add_argument("--pillar",   required=True,  choices=VALID_PILLARS)
    p.add_argument("--type",     required=True,  choices=VALID_TYPES, dest="post_type")
    p.add_argument("--copy",     required=True,  help="Texto completo del post")
    p.add_argument("--prompt",   required=True,  help="Prompt para Ideogram")
    p.add_argument("--hashtags", default="",     help="Hashtags separados por espacio")
    p.add_argument("--cta",      default="",     help="URL del CTA (vacío = auto con UTMs por post_type)")
    args = p.parse_args()

    # cta_url: si no se pasa, se construye con UTMs según post_type/pillar/platform.
    cta_url = args.cta.strip() or build_cta_url(
        args.platform, args.pillar, args.post_type, args.date
    )

    # CTA dura en el copy para posts de conversión (si no está ya presente).
    copy_text = args.copy
    if args.post_type == "conversion" and "Agenda tu diagnóstico" not in copy_text:
        copy_text = copy_text.rstrip() + "\n\n" + HARD_CTA

    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    post_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO content_plan
          (id, scheduled_date, scheduled_time, platform, format, pillar,
           post_type, copy_text, image_prompt, hashtags, cta_url, status)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'pending')
        RETURNING id
    """, (
        post_id, args.date, args.time, args.platform, args.format,
        args.pillar, args.post_type, copy_text, args.prompt,
        args.hashtags, cta_url,
    ))
    conn.commit()
    cur.close()
    conn.close()
    print(f"OK — post insertado con ID: {post_id}")

if __name__ == "__main__":
    main()
