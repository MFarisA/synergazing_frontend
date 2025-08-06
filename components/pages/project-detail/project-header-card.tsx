"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, Users, Clock, Heart, Share2 } from "lucide-react";
import type { ProjectDetail } from '@/types';

interface ProjectHeaderCardProps {
  project: ProjectDetail;
}

export function ProjectHeaderCard({ project }: ProjectHeaderCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <Card>
      <div className="relative">
        <img src={project.image} alt={project.title} className="w-full h-64 object-cover " />
        <div className="absolute top-4 right-4 flex gap-2"> 
          <Button size="icon" variant="secondary" className="h-9 w-9"><Share2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-sm">{project.type}</Badge>
          <span className="text-sm text-gray-500">{project.posted}</span>
        </div>
        <CardTitle className="text-2xl">{project.title}</CardTitle>
        <CardDescription className="text-base">{project.description}</CardDescription>
        <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>Deadline: {project.deadline}</span></div>
        </div>
      </CardHeader>
    </Card>
  );
}