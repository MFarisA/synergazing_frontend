"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Project } from "@/types";

// Import komponen-komponen yang telah dipecah
import { ProjectHeaderCard } from "@/components/pages/project-detail/project-header-card";
import { ProjectTabsContent } from "@/components/pages/project-detail/project-tabs-content";
import { ProjectSidebar } from "@/components/pages/project-detail/project-sidebar";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch project from API
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError('Please log in to view project details.');
          return;
        }
        
        // For now, we'll get all projects and find the specific one
        // Ideally, there should be a getProjectById API endpoint
        const response = await api.getAllProjects(token);
        const projectsData = response.data?.projects || response.projects || response.data || [];
        const foundProject = projectsData.find((p: Project) => p.id.toString() === projectId);
        
        if (foundProject) {
          setProject(foundProject);
          setError(null);
        } else {
          setError('Project not found.');
        }
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proyek Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-4">{error || 'Proyek yang Anda cari tidak tersedia.'}</p>
          <Link href="/projects">
            <Button>Kembali ke Daftar Proyek</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/projects"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button></Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
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