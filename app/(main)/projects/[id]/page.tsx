"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProjectHeaderCard } from "@/components/pages/project-detail/project-header-card";
import { ProjectTabsContent } from "@/components/pages/project-detail/project-tabs-content";
import { ProjectSidebar } from "@/components/pages/project-detail/project-sidebar";
import type { ProjectDetail } from "@/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const base = process.env.NEXT_PUBLIC_API_URL;
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${base}/api/projects/${projectId}`, {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          // Try to read error body for message
          let message = `Gagal memuat proyek (${res.status})`;
          try {
            const errBody = await res.json();
            if (errBody?.message) message = errBody.message;
          } catch {}
          throw new Error(message);
        }

        const body = await res.json();
        const p = body?.data ?? body;

        // Map API response to ProjectDetail shape expected by UI components
        const skillsFromMembers: string[] = Array.isArray(p?.Members)
          ? p.Members.flatMap((m: any) => Array.isArray(m.SkillNames) ? m.SkillNames : [])
          : [];
        const skillsFromRoles: string[] = Array.isArray(p?.Roles)
          ? p.Roles.flatMap((r: any) => Array.isArray(r.RequiredSkills) ? r.RequiredSkills.map((rs: any) => rs.Skill?.Name ?? rs.Name).filter(Boolean) : [])
          : [];
        const uniqueSkills = Array.from(new Set([...(p?.Skills ?? []), ...skillsFromMembers, ...skillsFromRoles])).filter(Boolean);

        const mapped: ProjectDetail = {
          id: p.ID ?? p.id ?? 0,
          title: p.Title ?? p.title ?? "Untitled Project",
          description: p.Description ?? p.description ?? "",
          fullDescription: p.FullDescription ?? p.fullDescription ?? p.Description ?? "",
          recruiter: {
            name: p.Creator?.Name ?? p.creator?.name ?? "",
            avatar: p.Creator?.AvatarURL ?? p.creator?.avatar ?? "/placeholder.svg",
            major: p.Creator?.Major ?? p.creator?.major ?? "",
            university: p.Creator?.University ?? p.creator?.university ?? "",
            year: p.Creator?.Year ?? p.creator?.year ?? "",
            rating: p.Creator?.Rating ?? p.creator?.rating ?? 0,
            projects: p.Creator?.Projects ?? p.creator?.projects ?? 0,
            connections: p.Creator?.Connections ?? p.creator?.connections ?? 0,
            completedProjects: p.Creator?.CompletedProjects ?? p.creator?.completedProjects ?? 0,
            bio: p.Creator?.Bio ?? p.creator?.bio ?? "",
            skills: Array.isArray(p.Creator?.Skills) ? p.Creator.Skills : [],
            socialLinks: p.Creator?.SocialLinks ?? p.creator?.socialLinks ?? { github: "#", linkedin: "#", portfolio: "#" },
          },
          skills: uniqueSkills,
          duration: p.Duration ?? p.duration ?? "",
          startDate: p.StartDate ?? p.startDate ?? "",
          endDate: p.EndDate ?? p.endDate ?? "",
          members: (() => {
            const current = p.MembersCount ?? (Array.isArray(p.Members) ? p.Members.length : undefined);
            const total = p.TeamSize ?? p.MaxMembers;
            if (current != null && total != null) return `${current}/${total}`;
            return p.members ?? "";
          })(),
          currentMembers: Array.isArray(p.Members)
            ? p.Members.map((m: any) => ({
                name: m.Name ?? "",
                role: m.RoleName ?? m.RoleDescription ?? "",
                avatar: m.AvatarURL ?? "/placeholder.svg",
              }))
            : [],
          neededRoles: Array.isArray(p.Roles)
            ? p.Roles.map((r: any) => ({
                role: r.Name ?? "",
                description: r.Description ?? "",
                skills: Array.isArray(r.RequiredSkills) ? r.RequiredSkills.map((rs: any) => rs.Skill?.Name ?? rs.Name).filter(Boolean) : [],
                count: r.SlotsAvailable ?? r.Count ?? 1,
              }))
            : [],
          type: p.Type ?? p.type ?? "",
          location: p.Location ?? p.location ?? "",
          workType: p.WorkType ?? p.workType ?? "",
          posted: p.PostedHumanized ?? p.posted ?? "",
          image: p.PictureURL ?? p.picture_url ?? p.image ?? "/placeholder.svg",
          budget: p.Budget ?? p.budget ?? "",
          deadline: p.Deadline ?? p.deadline ?? "",
          status: p.Status ?? p.status ?? "Recruiting",
          timeline: Array.isArray(p.Timeline)
            ? p.Timeline.map((t: any) => ({
                phase: t.Timeline?.Name ?? t.Name ?? "",
                status: (t.Status ?? "pending") as "completed" | "in-progress" | "pending",
                description: t.Description ?? "",
              }))
            : [],
          requirements: Array.isArray(p.Requirements) ? p.Requirements.map((r: any) => (typeof r === 'string' ? r : r.Name ?? r.Description ?? "")).filter(Boolean) : [],
          benefits: Array.isArray(p.Benefits) ? p.Benefits.map((b: any) => b.Benefit?.Name ?? b.Name ?? "").filter(Boolean) : [],
          tags: Array.isArray(p.Tags) ? p.Tags : [],
        } as ProjectDetail;

        setProject(mapped);
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        setError(e.message || 'Gagal memuat proyek');
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">Memuat detail proyek...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error ? 'Terjadi Kesalahan' : 'Proyek Tidak Ditemukan'}</h1>
          <p className="text-gray-600 mb-4">{error ?? 'Proyek yang Anda cari tidak tersedia.'}</p>
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