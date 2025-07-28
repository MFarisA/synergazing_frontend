import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Clock, Eye, Star, Heart, Share2, Info } from "lucide-react";
import { ChatDialog } from "./chat-dialog";
import { SynergizeDialog } from "./synergize-dialog";
import type { Project } from "@/types";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group flex flex-col">
      <div className="relative">
        <img src={project.image} alt={project.title} className="w-full h-48 object-cover rounded-t-lg" />
        {project.urgent && <Badge className="absolute top-3 left-3 bg-red-500 text-white border-red-500">Urgent</Badge>}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">\
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0"><Share2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{project.type}</Badge>
          <span className="text-sm text-gray-500">{project.posted}</span>
        </div>
        <CardTitle className="text-lg hover:text-blue-600 cursor-pointer">{project.title}</CardTitle>
        <CardDescription className="line-clamp-2 h-10">{project.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0 space-y-4 flex-grow flex flex-col">
        <div className="flex-grow space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-12 w-12"><AvatarImage src={project.recruiter.avatar} /><AvatarFallback>{project.recruiter.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
            <div className="flex-1">
              <p className="font-medium">{project.recruiter.name}</p>
              <p className="text-sm text-gray-600">{project.recruiter.major}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
               <span>{project.recruiter.projects} proyek</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.skills.slice(0, 4).map((skill) => <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>)}
            {project.skills.length > 4 && <Badge variant="secondary" className="text-xs">+{project.skills.length - 4}</Badge>}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600"><Calendar className="h-4 w-4" /><span>{project.duration}</span></div>
            <div className="flex items-center gap-2 text-gray-600"><Users className="h-4 w-4" /><span>{project.members}</span></div>
            <div className="flex items-center gap-2 text-gray-600"><MapPin className="h-4 w-4" /><span>{project.location}</span></div>
            <div className="flex items-center gap-2 text-gray-600"><Clock className="h-4 w-4" /><span>{project.deadline}</span></div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2 border-t mt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
               
            </div>
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
      </CardContent>
    </Card>
  );
}