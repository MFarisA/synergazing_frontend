"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List } from "lucide-react";

import { SidebarFilters } from "@/components/pages/projects/sidebar-filters";
import { ProjectList } from "@/components/pages/projects/project-list";
import { api } from "@/lib/api";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError('Please log in to view projects.');
          return;
        }
        
        const response = await api.getAllProjects(token);
        // Handle API response structure - data might be in response.data.projects or response.projects
        const projectsData = response.data?.projects || response.projects || response.data || [];
        setProjects(projectsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Generate dynamic options from fetched projects
  const skillOptions = Array.from(
    new Set(
      projects.flatMap(project => 
        project.required_skills.map(skill => skill.skill.name)
      )
    )
  ).sort();

  const locationOptions = Array.from(
    new Set(projects.map(project => project.location).filter(Boolean))
  ).sort();

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.required_skills.some((skill) => 
        skill.skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesType = selectedType === "all" || project.project_type === selectedType;
    const matchesLocation = selectedLocation === "all" || project.location === selectedLocation;
    const matchesSkills = selectedSkills.length === 0 || selectedSkills.some((skill) => 
      project.required_skills.some(projectSkill => projectSkill.skill.name === skill)
    );
    return matchesSearch && matchesType && matchesLocation && matchesSkills;
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat proyek...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Coba Lagi
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
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
                    <h2 className="text-xl font-semibold">{filteredProjects.length} Proyek Ditemukan</h2>
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
            
            <ProjectList projects={filteredProjects} viewMode={viewMode} />

            {/* Pagination */}
            <div className="flex items-center justify-center mt-12 gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm" className="bg-blue-600 text-white border-blue-600">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Next</Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}