import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ArrowRight, Users, Briefcase, GraduationCap } from "lucide-react";

export function Hero() {
  return (
    <AuroraBackground className="w-full py-12 md:py-24 lg:py-32 h-full min-h-[100vh]">
      <div className="container px-4 md:px-6 mx-auto z-10 relative">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-r from-[#0088FF] to-[#CB30E0] bg-clip-text text-transparent">
              Platform Kolaborasi Proyek Mahasiswa
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300">
              Temukan rekan kolaborasi yang tepat, bergabung dengan proyek
              menarik, atau rekrut talenta terbaik untuk proyek Anda.
              Seperti LinkedIn bertemu Facebook Marketplace untuk mahasiswa.
            </p>
          </div>
          <div className="space-x-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#0088FF] to-[#CB30E0]"
            >
              Mulai Berkolaborasi
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Jelajahi Proyek
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-8">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>1000+ Mahasiswa</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>500+ Proyek Aktif</span>
            </div>
            <div className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>50+ Kampus</span>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}