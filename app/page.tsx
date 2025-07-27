import { Hero } from "@/components/pages/home/hero";
import { Features } from "@/components/pages/home/features";
import { ProjectShowcase } from "@/components/pages/home/project-showcase";
import { HowItWorks } from "@/components/pages/home/how-it-works";
import { Cta } from "@/components/pages/home/cta";
import { PageFooter } from "@/components/pages/home/page-footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        <Hero />
        <Features />
        <ProjectShowcase />
        <HowItWorks />
        <Cta />
      </main>
      <PageFooter />
    </div>
  );
}