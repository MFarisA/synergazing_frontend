import { Hero } from "@/components/pages/home/hero";
import { Features } from "@/components/pages/home/features";
import { HowItWorks } from "@/components/pages/home/how-it-works";
import { PageFooter } from "@/components/pages/home/page-footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        <Hero />
        
        {/* LINGKUPI Features dan HowItWorks DENGAN DIV BARU INI */}
        <div className="w-full bg-gradient-to-br from-gray-50 via-slate-100 to-gray-100 relative overflow-hidden">
          {/* Pindahkan juga elemen overlay gradient ke sini */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent"></div>
          <Features />
          <HowItWorks />
        </div>
        
      </main>
      <PageFooter />
    </div>
  );
}