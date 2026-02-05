"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, Users, Clock, Heart, Share2 } from "lucide-react";
import type { Project } from '@/types';

interface ProjectHeaderCardProps {
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

export function ProjectHeaderCard({ project }: ProjectHeaderCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <Card>
      <div className="relative">
        <img src={project.picture_url} alt={project.title} className="w-full h-64 object-cover" />
        <div className="absolute top-4 right-4 flex gap-2">
          <Button size="icon" variant="secondary" className="h-9 w-9"><Share2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-sm">{project.project_type}</Badge>
          <span className="text-sm text-gray-500">{timeAgo(project.created_at || project.start_date)}</span>
        </div>
        <CardTitle className="text-2xl">{project.title}</CardTitle>
        <CardDescription className="text-base whitespace-pre-line">{project.description}</CardDescription>
        <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Deadline: {formatDate(project.registration_deadline)}</span>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}