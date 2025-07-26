"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { projectsData } from "@/lib/project-detail-data";

// Import komponen-komponen yang telah dipecah
import { ProjectHeaderCard } from "@/components/pages/project-detail/project-header-card";
import { ProjectTabsContent } from "@/components/pages/project-detail/project-tabs-content";
import { ProjectSidebar } from "@/components/pages/project-detail/project-sidebar";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const project = projectsData[projectId as keyof typeof projectsData];

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proyek Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-4">Proyek yang Anda cari tidak tersedia.</p>
          <Link href="/projects">
            <Button>Kembali ke Daftar Proyek</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/projects"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button></Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center"><Zap className="h-4 w-4 text-white" /></div>
              <span className="font-bold text-lg">Synergazing</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2 space-y-6">
            <ProjectHeaderCard project={project} />
            <ProjectTabsContent project={project} />
          </main>
          <ProjectSidebar project={project} />
        </div>
      </div>
    </div>
  );
}