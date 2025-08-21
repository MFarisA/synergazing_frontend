import { ProjectCard } from "./project-card";
import type { Project } from "@/types";

interface ProjectListProps {
  projects: Project[];
  viewMode: "grid" | "list";
}

export function ProjectList({ projects, viewMode }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Tidak ada proyek yang ditemukan.</p>
        <p className="text-sm text-gray-400 mt-2">Coba ubah filter atau kata kunci pencarian Anda.</p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
          : "space-y-4"
      }
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}