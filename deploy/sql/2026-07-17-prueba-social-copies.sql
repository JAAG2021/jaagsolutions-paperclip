-- deploy/sql/2026-07-17-prueba-social-copies.sql
-- Reescritura de copies de prueba_social como narrativa texto_largo:
-- gancho en linea 1, dolor -> solucion, marco de prueba social, UN solo CTA
-- (conversion: CTA duro, sin comment-bait). Sin em dash. Update por id.
--
-- Ejecutar dentro del container postgres deploy-postgres-1.

BEGIN;

-- 2026-07-31 | prueba_social | conversion | texto_largo
UPDATE content_plan SET copy_text = $$Julio se va con las mismas tareas manuales con las que entró. Ese es, exactamente, tu primer proyecto de agosto.

Cada factura copiada a mano, cada recordatorio enviado uno por uno, cada reporte armado de cero: por separado parecen minutos. Sumados, son días completos del equipo que no vuelven.

No hace falta automatizar todo. Alcanza con empezar por el proceso que más se repite, el que todos odian. Se convierte en un flujo, se mide, y desde ahí escalas con menos riesgo.

Así es como negocios como el tuyo dejan de apagar incendios y empiezan a operar con sistema.

👉 Agenda tu diagnóstico gratuito de 10 minutos.$$
WHERE id = '2eb431b4-38c4-482a-a50b-b847da629936';

COMMIT;

-- Verificacion:
-- SELECT id, format, copy_text FROM content_plan WHERE id='2eb431b4-38c4-482a-a50b-b847da629936';
