"use client";

import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ArrowRight, Users, Briefcase, GraduationCap } from "lucide-react";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";

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
            Your Next Great Team is Here. Platform eksklusif bagi mahasiswa untuk berkolaborasi, berinovasi, dan membangun portofolio. Temukan proyek, rekrut talenta, wujudkan karyamu.
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
            <Link href="/projects">
              <Button variant="outline" size="lg">
                Jelajahi Proyek
              </Button>
            </Link>
            
          </div>
          <div className="space-y-4">
            
            {/* Efek Typewriting untuk Slogan dan Deskripsi */}
            <TypeAnimation
              sequence={[
                "Find Your Team.",
                1000,
                "Find Your Team, Synergize Your Idea.",
                2000,
                "Temukan rekan untuk Lomba.",
                1000,
                "Temukan rekan untuk Riset Penelitian.",
                1000,
                "Temukan rekan untuk Proyek Kuliah.",
                1000,
                "Find Your Team, Synergize Your Idea.",
                5000,
              ]}
              wrapper="p"
              speed={50}
              className="mx-auto max-w-[700px] text-gray-600 md:text-xl h-12 md:h-auto"
              repeat={Infinity}
            />
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}