import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, Briefcase, Clock, Star, Github, Globe } from "lucide-react";
import Link from "next/link";
import type { Project } from '@/types';

interface ProjectSidebarProps {
  project: Project;
}

// Utility function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  // Map API data to display format
  const creatorAvatar = project.creator.profile?.profile_picture || '';
  const creatorRole = project.creator.profile?.interests || 'Project Creator';
  const creatorAbout = `Passionate about ${project.project_type} projects. Experienced in full-stack development with a focus on innovative solutions.`;
  const statusText = project.status === "published" ? "Recruiting" : project.status;
  
  return (
    <aside className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Informasi Proyek</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Durasi</p>
              <p className="text-gray-600">{project.duration} ({formatDate(project.start_date)} - {formatDate(project.end_date)})</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Lokasi</p>
              <p className="text-gray-600">{project.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Tim</p>
              <p className="text-gray-600">{project.filled_team+1}/{project.total_team}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Budget</p>
              <p className="text-gray-600 font-semibold text-green-600">{project.budget}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">Status</p>
              <Badge variant={project.status === "published" ? "default" : "secondary"} className="text-xs">
                {statusText}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Project Leader</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={creatorAvatar} />
              <AvatarFallback>{project.creator.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{project.creator.name}</p>
              <p className="text-sm text-gray-600">{creatorRole}</p>
              <p className="text-sm text-gray-600">{project.project_type}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">{creatorAbout}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              <Github className="h-4 w-4 mr-1" />GitHub
            </Button>
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              <Globe className="h-4 w-4 mr-1" />Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}