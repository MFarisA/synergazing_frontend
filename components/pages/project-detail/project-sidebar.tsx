import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, Briefcase, Clock, Star, Github, Globe } from "lucide-react";
import Link from "next/link";
// import { ChatDialog } from "./chat-dialog"; // Akan kita buat
// import { SynergizeDialog } from "./synergize-dialog"; // Akan kita buat
import type { ProjectDetail } from '@/types';

interface ProjectSidebarProps {
  project: ProjectDetail;
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  return (
    <aside className="space-y-6">
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* <SynergizeDialog project={project} />
          <ChatDialog project={project} /> */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Informasi Proyek</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-start gap-3"><Calendar className="h-5 w-5 text-gray-400 mt-0.5" /><div><p className="font-medium">Durasi</p><p className="text-gray-600">{project.duration} ({project.startDate} - {project.endDate})</p></div></div>
          <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-gray-400 mt-0.5" /><div><p className="font-medium">Lokasi</p><p className="text-gray-600">{project.workType}</p></div></div>
          <div className="flex items-start gap-3"><Users className="h-5 w-5 text-gray-400 mt-0.5" /><div><p className="font-medium">Tim</p><p className="text-gray-600">{project.members}</p></div></div>
          <div className="flex items-start gap-3"><Briefcase className="h-5 w-5 text-gray-400 mt-0.5" /><div><p className="font-medium">Budget</p><p className="text-gray-600 font-semibold text-green-600">{project.budget}</p></div></div>
          <div className="flex items-start gap-3"><Clock className="h-5 w-5 text-gray-400 mt-0.5" /><div><p className="font-medium">Status</p><Badge variant={project.status === "Recruiting" ? "default" : "secondary"} className="text-xs">{project.status}</Badge></div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Project Leader</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-16 w-16"><AvatarImage src={project.recruiter.avatar} /><AvatarFallback>{project.recruiter.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
            <div>
              <p className="font-semibold">{project.recruiter.name}</p>
              <p className="text-sm text-gray-600">{project.recruiter.major}</p>
              <p className="text-sm text-gray-600">{project.recruiter.university}</p>
              <div className="flex items-center gap-1 mt-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="text-sm">{project.recruiter.rating}</span></div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-4">{project.recruiter.bio}</p>
          <div className="flex gap-2">
            <Link href={project.recruiter.socialLinks.github} target="_blank" className="flex-1"><Button size="sm" variant="outline" className="w-full bg-transparent"><Github className="h-4 w-4 mr-1" />GitHub</Button></Link>
            <Link href={project.recruiter.socialLinks.portfolio} target="_blank" className="flex-1"><Button size="sm" variant="outline" className="w-full bg-transparent"><Globe className="h-4 w-4 mr-1" />Portfolio</Button></Link>
          </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{project.tags.map((tag) => (<Badge key={tag} variant="secondary">#{tag}</Badge>))}</div></CardContent>
      </Card>
    </aside>
  );
}