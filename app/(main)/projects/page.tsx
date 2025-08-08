"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List } from "lucide-react";
// import { ProjectsHeader } from "@/components/pages/projects/projects-header";
import { SidebarFilters } from "@/components/pages/projects/sidebar-filters";
import { ProjectList } from "@/components/pages/projects/project-list";
import type { Project } from "@/types";

// Import only filter options (remove mock projects)
import { skillOptions, locationOptions } from "@/lib/data";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const base = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${base}/api/projects/all`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Failed to load projects (${res.status})`);
        }
        const body = await res.json().catch(() => null);
        const raw = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
        const mapped: Project[] = raw.map((p: any): Project => ({
          id: p.ID ?? p.id ?? 0,
          title: p.Title ?? p.title ?? "Untitled Project",
          description: p.Description ?? p.description ?? "",
          recruiter: {
            name: p.Creator?.Name ?? p.creator?.name ?? "",
            avatar: p.Creator?.AvatarURL ?? p.creator?.avatar ?? "/placeholder.svg",
            major: p.Creator?.Major ?? p.creator?.major ?? "",
            university: p.Creator?.University ?? p.creator?.university ?? "",
            rating: p.Creator?.Rating ?? p.creator?.rating ?? 0,
            projects: p.Creator?.Projects ?? p.creator?.projects ?? 0,
            connections: p.Creator?.Connections ?? p.creator?.connections ?? 0,
          },
          skills: (p.Skills?.map((s: any) => s.Name) ?? p.skills ?? []),
          duration: p.Duration ?? p.duration ?? "",
          members: (() => {
            const current = p.MembersCount ?? p.membersCurrent ?? (Array.isArray(p.Members) ? p.Members.length : undefined);
            const total = p.TeamSize ?? p.membersTotal ?? p.MaxMembers ?? p.maxMembers;
            if (current != null && total != null) return `${current}/${total}`;
            return p.members ?? "";
          })(),
          type: p.Type ?? p.type ?? "",
          location: p.Location ?? p.location ?? "",
          posted: p.PostedHumanized ?? p.posted ?? "",
          image: p.PictureURL ?? p.picture_url ?? p.image ?? "/placeholder.svg",
          views: p.Views ?? p.views ?? 0,
          deadline: p.Deadline ?? p.deadline ?? "",
        }));
        setProjects(mapped);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        setError(e.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  const filteredProjects = useMemo(() => {
    const list = projects.slice();
    // Basic client-side sort (fallback since API has no sorting yet)
    if (sortBy === "popular") list.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    // "newest" and "deadline" could be enhanced once API provides fields

    return list.filter((project) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.skills.some((skill) => skill.toLowerCase().includes(q));
      const matchesType = selectedType === "all" || project.type === selectedType;
      const matchesLocation = selectedLocation === "all" || project.location === selectedLocation;
      const matchesSkills = selectedSkills.length === 0 || selectedSkills.some((skill) => project.skills.includes(skill));
      return matchesSearch && matchesType && matchesLocation && matchesSkills;
    });
  }, [projects, searchQuery, selectedType, selectedLocation, selectedSkills, sortBy]);

  const handleSkillToggle = (skill: string) => {
    if (skill === '') {
      setSelectedSkills([]);
      return;
    }
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };
  
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedLocation("all");
    setSelectedSkills([]);
  };

  const isFilterActive = searchQuery || selectedType !== "all" || selectedLocation !== "all" || selectedSkills.length > 0;

  return (
    <div className="min-h-screen ">
      {/* ProjectsHeader dihapus dari sini */}
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Teruskan semua props filter ke SidebarFilters */}
          <SidebarFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            locationOptions={locationOptions}
            skillOptions={skillOptions}
            selectedSkills={selectedSkills}
            handleSkillToggle={handleSkillToggle}
          />
          
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">
                      {loading ? "Memuat..." : error ? "0 Proyek Ditemukan" : `${filteredProjects.length} Proyek Ditemukan`}
                    </h2>
                    {isFilterActive && (
                        <Button variant="outline" size="sm" onClick={clearAllFilters}>Clear All Filters</Button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Terbaru</SelectItem>
                            <SelectItem value="popular">Terpopuler</SelectItem>
                            <SelectItem value="deadline">Deadline</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex border rounded-lg overflow-hidden">
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-none"><Grid3X3 className="h-4 w-4" /></Button>
                        <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-none"><List className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
            
            {error ? (
              <div className="text-center py-10 text-red-600">{error}</div>
            ) : loading ? (
              <div className="text-center py-10 text-gray-500">Memuat daftar proyek...</div>
            ) : (
              <ProjectList projects={filteredProjects} viewMode={viewMode} />
            )}

            {/* Pagination (placeholder since API has no pagination yet) */}
            {!loading && !error && (
              <div className="flex items-center justify-center mt-12 gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm" className="bg-blue-600 text-white border-blue-600">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">Next</Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}