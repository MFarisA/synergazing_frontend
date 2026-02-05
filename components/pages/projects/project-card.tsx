import { Card, CardDescription, CardTitle } from "@/components/ui/card"; // CardHeader & CardContent bisa dihapus dari import jika tidak dipakai lagi
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Clock, Info, Share2 } from "lucide-react";
import { ChatDialog } from "./chat-dialog";
import { SynergizeDialog } from "./synergize-dialog";
import type { Project } from "@/types";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

// Utility function to format relative time
const timeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} bulan yang lalu`;
  return `${Math.floor(diffInSeconds / 31536000)} tahun yang lalu`;
};

// Utility function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export function ProjectCard({ project }: ProjectCardProps) {
  // Map API data to display format
  const skills = project.required_skills.map(skill => skill.skill.name);
  const membersText = `${project.filled_team + 1}/${project.total_team}`;
  const creatorAvatar = project.creator.profile?.profile_picture || '';
  const creatorRole = project.creator.profile?.interests || 'Main Role';

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group flex flex-col overflow-hidden">

      {/* BAGIAN 1: GAMBAR */}
      <div className="relative h-48 w-full flex-shrink-0">
        <img
          src={project.picture_url}
          alt={project.title}
          className="h-full w-full object-cover"
        />
        {/* <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0"><Share2 className="h-4 w-4" /></Button>
        </div> */}
      </div>

      {/* BAGIAN 2: KONTEN */}
      <div className="flex flex-grow flex-col p-4">

        {/* Header Info */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{project.project_type}</Badge>
          <span className="text-sm text-gray-500">{timeAgo(project.created_at || project.start_date)}</span>
        </div>
        <h2 className="text-lg font-semibold leading-tight tracking-tight hover:text-blue-600 cursor-pointer">{project.title}</h2>
        <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">{project.description}</p>

        {/* Main Content */}
        <div className="mt-4 flex-grow space-y-4">

          {/* Creator Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={creatorAvatar} />
              <AvatarFallback>{project.creator.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{project.creator.name}</p>
              <p className="text-sm text-gray-600">{creatorRole}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 4).map((skill) => <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>)}
            {skills.length > 4 && <Badge variant="secondary" className="text-xs">+{skills.length - 4}</Badge>}
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600"><Calendar className="h-4 w-4" /><span>{project.duration}</span></div>
            <div className="flex items-center gap-2 text-gray-600"><Users className="h-4 w-4" /><span>{membersText}</span></div>
            <div className="flex items-center gap-2 text-gray-600"><MapPin className="h-4 w-4" /><span>{project.location}</span></div>
            <div className="flex items-center gap-2 text-gray-600"><Clock className="h-4 w-4" /><span>{formatDate(project.registration_deadline)}</span></div>
          </div>
        </div>

        {/* Tombol Footer */}
        <div className="pt-4 border-t mt-4">
          <div className="flex gap-2">
            <Link href={`/projects/${project.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Info className="h-4 w-4 mr-2" />
                Detail
              </Button>
            </Link>
            <ChatDialog project={project} />
            <SynergizeDialog project={project} />
          </div>
        </div>
      </div>
    </Card>
  );
}