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
      <StatsSection />
      <ToolsSection />
      <BenefitsSection />
      <RoiCalculatorSection />
      <ServicesSection />
      <ProcessSection />
      <UseCasesSection />
      <TestimonialsSection />
      <PricingSection />
      <ComparisonSection />
      <ContactFormSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
