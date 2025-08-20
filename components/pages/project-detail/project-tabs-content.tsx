import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, AlertCircle, Target, Clock, Play, Check } from "lucide-react";
import type { Project } from '@/types';

interface ProjectTabsContentProps {
  project: Project;
}

// Timeline status configuration
const TIMELINE_STATUS_CONFIG = {
  "not-started": {
    label: "Belum Dimulai",
    color: "#6B7280", // Gray
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    icon: Clock
  },
  "in-progress": {
    label: "Sedang Berjalan", 
    color: "#F59E0B", // Yellow/Orange
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    icon: Play
  },
  "done": {
    label: "Selesai",
    color: "#10B981", // Green
    bgColor: "bg-green-100", 
    textColor: "text-green-700",
    icon: Check
  }
};

export function ProjectTabsContent({ project }: ProjectTabsContentProps) {
  // Map API data to display format
  const skills = project.required_skills.map(skill => skill.skill.name);
  const benefits = project.benefits.map(benefit => benefit.benefit.name);
  const conditions = project.conditions.map(condition => condition.description);
  
  // Updated timeline mapping to include status
  const timelineItems = project.timeline.map(item => ({
    name: item.timeline.name,
    status: item.timeline_status || "not-started"
  }));

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="requirements">Requirements</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="team">Tim</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 mt-4">
        <Card>
          <CardHeader><CardTitle>Deskripsi Lengkap Proyek</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-line text-gray-700">{project.description}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Teknologi & Skills</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Apa yang Akan Anda Dapatkan</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /><span>{benefit}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Timeline Proyek</CardTitle>
            <CardDescription>Rencana pengembangan dari awal hingga selesai dengan status terkini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timelineItems.map((phase, i) => {
              const statusConfig = TIMELINE_STATUS_CONFIG[phase.status as keyof typeof TIMELINE_STATUS_CONFIG] || TIMELINE_STATUS_CONFIG["not-started"];
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}
                      style={{ borderColor: statusConfig.color, borderWidth: '2px' }}
                    >
                      <StatusIcon 
                        className="h-4 w-4" 
                        style={{ color: statusConfig.color }}
                      />
                    </div>
                    {i < timelineItems.length - 1 && (
                      <div className="h-8 w-0.5 bg-gray-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{phase.name}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 text-xs`}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            {timelineItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Timeline belum ditentukan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team" className="space-y-6 mt-4">
        <Card>
          <CardHeader><CardTitle>Tim Saat Ini ({project.members.length} orang)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {project.members.map((member, i) => (
              <div key={i} className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{member.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.role_name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.skill_names.map(skill => <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Posisi yang Dibutuhkan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {project.roles.map((role, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{role.name}</h4>
                  <Badge variant="secondary">{role.slots_available} slot tersedia</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-1">
                  {role.required_skills.map(skillItem => 
                    <Badge key={skillItem.skill.name} variant="outline" className="text-xs">{skillItem.skill.name}</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="requirements" className="mt-4">
        <Card>
          <CardHeader><CardTitle>Persyaratan</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {conditions.map((condition, i) => (
                <li key={i} className="flex items-start gap-2"><Target className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" /><span>{condition}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}