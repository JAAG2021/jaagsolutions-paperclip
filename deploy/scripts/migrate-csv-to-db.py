#!/usr/bin/env python3
# deploy/scripts/migrate-csv-to-db.py
# Migra el CSV de A4 del workspace Docker a la tabla content_plan en PostgreSQL.
# Ejecutar en VPS: python3 deploy/scripts/migrate-csv-to-db.py

import csv
import os
import sys
import uuid
import psycopg2
from datetime import datetime

DB_URL = os.environ.get("DATABASE_URL")
if not DB_URL:
    print("ERROR: DATABASE_URL no definida")
    sys.exit(1)

CSV_PATH = "/paperclip/workspace/linkedin_first8_schedule.csv"

PLATFORM_MAP = {
    "LinkedIn": "linkedin",
    "Instagram": "instagram",
    "Facebook": "facebook",
    "Meta": "meta",
}

FORMAT_MAP = {
    "imagen_copy": "imagen_copy",
    "carrusel": "carrusel",
    "texto_largo": "texto_largo",
    "reel": "reel",
    "Imagen": "imagen_copy",
    "Texto largo": "texto_largo",
}

PILLAR_MAP = {
    "Educación": "educacion",
    "educacion": "educacion",
    "Casos de Uso": "casos_de_uso",
    "casos_de_uso": "casos_de_uso",
    "Prueba Social": "prueba_social",
    "prueba_social": "prueba_social",
    "Behind-the-Scenes": "behind_the_scenes",
    "behind_the_scenes": "behind_the_scenes",
}

def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    inserted = 0
    skipped = 0

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Normalizar campos
            platform = PLATFORM_MAP.get(row.get("platform", ""), row.get("platform", "linkedin")).lower()
            fmt = FORMAT_MAP.get(row.get("format", ""), "imagen_copy")
            pillar = PILLAR_MAP.get(row.get("pillar", ""), "educacion")
            post_type = row.get("post_type", "valor").lower()
            scheduled_date = row.get("scheduled_date") or row.get("date") or row.get("fecha")
            scheduled_time = row.get("scheduled_time") or row.get("time") or row.get("hora") or "10:00"
            copy_text = row.get("copy_text") or row.get("copy") or row.get("texto") or ""
            image_prompt = row.get("image_prompt") or row.get("prompt") or ""
            hashtags = row.get("hashtags") or ""
            cta_url = row.get("cta_url") or ""

            if not copy_text:
                print(f"  SKIP fila vacía: {row}")
                skipped += 1
                continue

            cur.execute("""
                INSERT INTO content_plan
                  (id, scheduled_date, scheduled_time, platform, format, pillar,
                   post_type, copy_text, image_prompt, hashtags, cta_url, status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'pending')
                ON CONFLICT DO NOTHING
            """, (
                str(uuid.uuid4()),
                scheduled_date,
                scheduled_time,
                platform,
                fmt,
                pillar,
                post_type,
                copy_text,
                image_prompt,
                hashtags,
                cta_url,
            ))
            inserted += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"Migración completa: {inserted} filas insertadas, {skipped} omitidas.")

if __name__ == "__main__":
    main()
