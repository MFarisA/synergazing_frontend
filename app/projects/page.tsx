"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List } from "lucide-react";

// Import komponen-komponen baru
import { ProjectsHeader } from "@/components/pages/projects/projects-header";
import { SidebarFilters } from "@/components/pages/projects/sidebar-filters";
import { ProjectList } from "@/components/pages/projects/project-list";

// Import data dari file terpisah
import { projects, skillOptions, locationOptions } from "@/lib/data";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "all" || project.type === selectedType;
    const matchesLocation = selectedLocation === "all" || project.location === selectedLocation;
    const matchesSkills = selectedSkills.length === 0 || selectedSkills.some((skill) => project.skills.includes(skill));
    return matchesSearch && matchesType && matchesLocation && matchesSkills;
  });

  const handleSkillToggle = (skill: string) => {
    // Jika skill kosong, artinya clear all
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectsHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        locationOptions={locationOptions}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <SidebarFilters
            skillOptions={skillOptions}
            selectedSkills={selectedSkills}
            handleSkillToggle={handleSkillToggle}
          />
          
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">{filteredProjects.length} Proyek Ditemukan</h2>
                    {(searchQuery || selectedType !== "all" || selectedLocation !== "all" || selectedSkills.length > 0) && (
                        <Button variant="outline" size="sm" onClick={clearAllFilters}>Clear Filters</Button>
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