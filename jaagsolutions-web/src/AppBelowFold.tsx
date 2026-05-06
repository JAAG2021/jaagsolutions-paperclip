import StatsSection from "./sections/StatsSection.tsx";
import ToolsSection from "./sections/ToolsSection.tsx";
import BenefitsSection from "./sections/BenefitsSection.tsx";
import RoiCalculatorSection from "./sections/RoiCalculatorSection.tsx";
import ServicesSection from "./sections/ServicesSection.tsx";
import ProcessSection from "./sections/ProcessSection.tsx";
import UseCasesSection from "./sections/UseCasesSection.tsx";
import TestimonialsSection from "./sections/TestimonialsSection.tsx";
import PricingSection from "./sections/PricingSection.tsx";
import ComparisonSection from "./sections/ComparisonSection.tsx";
import ContactFormSection from "./sections/ContactFormSection.tsx";
import FaqSection from "./sections/FaqSection.tsx";
import FinalCtaSection from "./sections/FinalCtaSection.tsx";

/** Contenido bajo el pliegue: un solo chunk asíncrono para reducir JS inicial. */
export default function AppBelowFold() {
  return (
    <>
      {/* 1. Casos reales primero — el escéptico ve "esto aplica a mi negocio" */}
      <UseCasesSection />
      {/* 2. Por qué funciona — beneficios diferenciadores */}
      <BenefitsSection />
      {/* 3. Cómo trabajamos — reduce el miedo a lo desconocido */}
      <ProcessSection />
      {/* 4. Qué ofrecemos — opciones concretas */}
      <ServicesSection />
      {/* 5. Validación social — otros como tú ya lo hicieron */}
      <TestimonialsSection />
      {/* 6. Números que respaldan */}
      <StatsSection />
      {/* 7. Calcula tu propio ahorro */}
      <RoiCalculatorSection />
      {/* 8. Precios — con toda la confianza ganada */}
      <PricingSection />
      {/* 9. Comparación — manejo de objeciones */}
      <ComparisonSection />
      {/* 10. Últimas dudas */}
      <FaqSection />
      {/* 11. Conversión */}
      <ContactFormSection />
      {/* 12. Último llamado */}
      <FinalCtaSection />
      {/* 13. Herramientas — credencial técnica al cierre */}
      <ToolsSection />
    </>
  );
}
