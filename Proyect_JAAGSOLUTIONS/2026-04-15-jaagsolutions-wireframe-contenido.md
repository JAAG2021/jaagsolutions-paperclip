# JAAGSOLUTIONS - Wireframe de contenido (implementacion React)

Guia de estructura UI para implementar la landing de JAAGSOLUTIONS en formato one-page.

## 1) Objetivo del wireframe

- Traducir el copy final a bloques de interfaz reutilizables.
- Definir orden de render, jerarquia visual y CTAs.
- Facilitar implementacion en React sin ambiguedades.

## 2) Arbol de componentes (alto nivel)

```text
LandingPage
  ├─ TopNav
  ├─ HeroSection
  ├─ BenefitsSection
  ├─ ServicesSection
  ├─ ProcessSection
  ├─ UseCasesSection
  ├─ ComparisonSection (Automatizacion vs SaaS)
  ├─ ContactFormSection
  ├─ FaqSection
  ├─ FinalCtaSection
  └─ FooterSection
```

## 3) Orden de render (desktop y mobile)

1. TopNav (sticky opcional)
2. HeroSection
3. BenefitsSection
4. ServicesSection
5. ProcessSection
6. UseCasesSection
7. ComparisonSection
8. ContactFormSection
9. FaqSection
10. FinalCtaSection
11. FooterSection

## 4) Especificacion por componente

## 4.1 TopNav
**Objetivo:** Navegacion rapida a anclas de secciones.

**Items recomendados:**
- Inicio
- Servicios
- Proceso
- Casos de uso
- Contacto

**Acciones:**
- Boton CTA pequeno: `Solicitar diagnostico`

**Comportamiento:**
- Scroll suave a seccion por `id`
- En mobile: menu colapsable

## 4.2 HeroSection
**Objetivo:** Comunicar propuesta dual (Automatizacion + SaaS) y provocar accion.

**Contenido:**
- H1
- Subtitulo
- CTA primario
- CTA secundario
- Microtexto de confianza

**Layout recomendado:**
- Desktop: 2 columnas (texto + visual/ilustracion)
- Mobile: 1 columna (texto primero)

## 4.3 BenefitsSection
**Objetivo:** Mostrar valor de negocio inmediato.

**Contenido:**
- Titulo H2
- Grid de 4 cards de beneficio

**Layout recomendado:**
- Desktop: 4 columnas o 2x2
- Tablet: 2x2
- Mobile: 1 columna

## 4.4 ServicesSection
**Objetivo:** Explicar dos pilares al mismo nivel.

**Contenido:**
- Titulo H2
- Subtitulo breve
- Dos cards principales:
  - Automatizacion de flujos
  - Desarrollo SaaS para PYMEs
- Lista de servicios en cada pilar
- CTA de seccion

**Layout recomendado:**
- Desktop: 2 columnas simetricas
- Mobile: cards apiladas

## 4.5 ProcessSection
**Objetivo:** Dar claridad operativa.

**Contenido:**
- Titulo H2
- 3 pasos numerados:
  1) Analizamos
  2) Implementamos
  3) Optimizamos
- CTA secundario

**Layout recomendado:**
- Desktop: timeline horizontal o 3 columnas
- Mobile: timeline vertical

## 4.6 UseCasesSection
**Objetivo:** Concretar aplicabilidad real por problema.

**Contenido:**
- Titulo H2
- 4-6 cards de caso de uso
- Estructura card:
  - Titulo
  - Problema
  - Solucion
  - Resultado esperado
- CTA: `Ver flujos para mi empresa`

**Layout recomendado:**
- Desktop: 2 o 3 columnas
- Mobile: 1 columna

## 4.7 ComparisonSection
**Objetivo:** Resolver duda "Automatizacion vs SaaS".

**Contenido:**
- Titulo H2
- Dos columnas comparativas
- Franja inferior con ruta recomendada:
  - Automatizacion -> Medicion -> Escalado SaaS
- CTA: `Solicitar diagnostico`

**Layout recomendado:**
- Desktop: 2 columnas + banda horizontal abajo
- Mobile: columnas apiladas + banda final

## 4.8 ContactFormSection
**Objetivo:** Conversion principal.

**Contenido:**
- Titulo H2
- Subtitulo
- Formulario:
  - Nombre completo
  - Empresa
  - Cargo
  - Email corporativo
  - WhatsApp
  - Sector
  - Rango de inversion
  - Proceso a mejorar (textarea)
- Boton submit
- Mensajes de exito/error

**Layout recomendado:**
- Desktop: 2 columnas (texto + form)
- Mobile: 1 columna

## 4.9 FaqSection
**Objetivo:** Reducir friccion final.

**Contenido:**
- Titulo H2
- 4 preguntas frecuentes (accordion)

**Layout recomendado:**
- Lista vertical tipo accordion

## 4.10 FinalCtaSection
**Objetivo:** Cierre comercial.

**Contenido:**
- Headline de cierre
- Texto de apoyo
- CTA final: `Hablar con un especialista`

## 4.11 FooterSection
**Objetivo:** Navegacion secundaria y legal.

**Contenido:**
- Marca + tagline
- Links de navegacion
- Links legales
- (Opcional) redes sociales

## 5) IDs de seccion (anclas)

Recomendadas para navegacion:
- `#inicio`
- `#beneficios`
- `#servicios`
- `#proceso`
- `#casos`
- `#comparativa`
- `#contacto`
- `#faq`

## 6) Reglas de contenido para implementacion

- Cada seccion debe cerrar con una idea de valor + accion.
- Evitar bloques largos de texto: maximo 2-3 lineas por parrafo.
- Mantener tono consultivo y orientado a resultado de negocio.
- Repetir CTA principal en puntos estrategicos (Hero, Comparativa, Final).

## 7) Criterios de aceptacion UI (MVP)

- [ ] Navegacion por anclas funciona en desktop/mobile
- [ ] Todos los CTAs son visibles y coherentes
- [ ] Formulario valida campos obligatorios
- [ ] Confirmacion de envio visible al usuario
- [ ] Layout responsive sin desbordes
- [ ] Tiempo de carga aceptable en mobile

## 8) Secuencia recomendada de desarrollo

1. Maquetar estructura base de secciones
2. Integrar copy final
3. Aplicar estilos y jerarquia visual
4. Conectar formulario a destino (CRM/email)
5. Revisar responsive
6. Ajustar conversion (CTA, orden, microcopy)

