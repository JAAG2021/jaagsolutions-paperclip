import TopNav from "./sections/TopNav.tsx";
import HeroSection from "./sections/HeroSection.tsx";
import BenefitsSection from "./sections/BenefitsSection.tsx";
import ServicesSection from "./sections/ServicesSection.tsx";
import ProcessSection from "./sections/ProcessSection.tsx";
import UseCasesSection from "./sections/UseCasesSection.tsx";
import ComparisonSection from "./sections/ComparisonSection.tsx";
import ContactFormSection from "./sections/ContactFormSection.tsx";
import FaqSection from "./sections/FaqSection.tsx";
import FinalCtaSection from "./sections/FinalCtaSection.tsx";
import FooterSection from "./sections/FooterSection.tsx";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main>
        <HeroSection />
        <BenefitsSection />
        <ServicesSection />
        <ProcessSection />
        <UseCasesSection />
        <ComparisonSection />
        <ContactFormSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
