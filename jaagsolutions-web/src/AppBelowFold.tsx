import ServicesSection from "./sections/ServicesSection.tsx";
import CaligraphaSection from "./sections/CaligraphaSection.tsx";
import ProcessSection from "./sections/ProcessSection.tsx";
import UseCasesSection from "./sections/UseCasesSection.tsx";
import ImpactSection from "./sections/ImpactSection.tsx";
import ObjectionsSection from "./sections/ObjectionsSection.tsx";
import ContactFormSection from "./sections/ContactFormSection.tsx";

/** Contenido bajo el pliegue: un solo chunk asíncrono para reducir JS inicial. */
export default function AppBelowFold() {
  return (
    <>
      {/* 1. Casos reales primero — el escéptico ve "esto aplica a mi negocio" */}
      <UseCasesSection />
      {/* 2. Cómo trabajamos — reduce el miedo a lo desconocido */}
      <ProcessSection />
      {/* 3. Qué ofrecemos — opciones concretas */}
      <ServicesSection />
      {/* 3b. Producto propio — la Línea B en producción, disponible hoy */}
      <CaligraphaSection />
      {/* 4. El impacto real — antes/después + números + calculadora */}
      <ImpactSection />
      {/* 5. Antes de decidir — comparativa + preguntas frecuentes (incl. cómo se cotiza) */}
      <ObjectionsSection />
      {/* 6. Conversión — cierre de la página */}
      <ContactFormSection />
    </>
  );
}
