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
    p.add_argument("--cta",      default="https://jaagsolutions.com", help="URL del CTA")
    args = p.parse_args()

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
        args.pillar, args.post_type, args.copy, args.prompt,
        args.hashtags, args.cta,
    ))
    conn.commit()
    cur.close()
    conn.close()
    print(f"OK — post insertado con ID: {post_id}")

if __name__ == "__main__":
    main()
