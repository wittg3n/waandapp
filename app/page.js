import HeroSection from "@/components/landing-page/sections/HeroSection";
import Problem from "@/components/landing-page/sections/Problem";
import SmoothScroll from "@/components/landing-page/SmoothScroll";
export default function Home() {
  return (
    <SmoothScroll>
      <section className="mt-2 ml-2 md:mt-8 md:ml-8">
        <HeroSection dir="ltr" />
        <Problem />
      </section>
    </SmoothScroll>
  );
}
