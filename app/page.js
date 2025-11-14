import HeroSection from "@/components/landing-page/sections/HeroSection";
import Problem from "@/components/landing-page/sections/Problem";
import SmoothScroll from "@/components/landing-page/SmoothScroll";
import ValueProposition from "@/components/landing-page/sections/ValueProposition";
import FeatureHighlights from "@/components/landing-page/sections/FeatureHighlights";
import ProcessTimeline from "@/components/landing-page/sections/ProcessTimeline";
import Testimonials from "@/components/landing-page/sections/Testimonials";
import PricingPlans from "@/components/landing-page/sections/PricingPlans";
import FAQ from "@/components/landing-page/sections/FAQ";
import FinalCTA from "@/components/landing-page/sections/FinalCTA";

export default function Home() {
  return (
    <SmoothScroll>
      <section className="mt-2 ml-2 md:mt-5 md:ml-8">
        <HeroSection dir="ltr" />
        <Problem />
        <ValueProposition />
        <FeatureHighlights />
        <ProcessTimeline />
        <Testimonials />
        <PricingPlans />
        <FAQ />
        <FinalCTA />
      </section>
    </SmoothScroll>
  );
}
