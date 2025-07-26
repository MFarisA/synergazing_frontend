import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, AlertCircle, Target } from "lucide-react";
import type { ProjectDetail } from '@/types';

interface ProjectTabsContentProps {
  project: ProjectDetail;
}

export function ProjectTabsContent({ project }: ProjectTabsContentProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="team">Tim</TabsTrigger>
        <TabsTrigger value="requirements">Requirements</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 mt-4">
        <Card>
          <CardHeader><CardTitle>Deskripsi Lengkap Proyek</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-line text-gray-700">{project.fullDescription}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Teknologi & Skills</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{project.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Apa yang Akan Anda Dapatkan</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {project.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /><span>{benefit}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline" className="mt-4">
        <Card>
          <CardHeader><CardTitle>Timeline Proyek</CardTitle><CardDescription>Rencana pengembangan dari awal hingga selesai.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {project.timeline.map((phase, i) => (
              <div key={i} className="flex items-start gap-4">
                <div>
                  {phase.status === 'completed' && <CheckCircle className="h-6 w-6 text-green-500" />}
                  {phase.status === 'in-progress' && <AlertCircle className="h-6 w-6 text-blue-500" />}
                  {phase.status === 'pending' && <div className="h-6 w-6 rounded-full border-2 border-gray-300 mt-0.5" />}
                </div>
                <div>
                  <h4 className="font-medium">{phase.phase}</h4>
                  <p className="text-sm text-gray-600">{phase.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team" className="space-y-6 mt-4">
        <Card>
          <CardHeader><CardTitle>Tim Saat Ini ({project.currentMembers.length} orang)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {project.currentMembers.map((member, i) => (
              <div key={i} className="flex items-center gap-4"><Avatar className="h-12 w-12"><AvatarImage src={member.avatar} /><AvatarFallback>{member.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback></Avatar><div><p className="font-medium">{member.name}</p><p className="text-sm text-gray-600">{member.role}</p></div></div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Posisi yang Dibutuhkan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {project.neededRoles.map((role, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2"><h4 className="font-medium">{role.role}</h4><Badge variant="secondary">{role.count} orang</Badge></div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-1">{role.skills.map(skill => <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>)}</div>
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
              {project.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2"><Target className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" /><span>{req}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}