"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import type { Project, ApplicationData } from '@/types';

interface SynergizeDialogProps {
  project: Project;
}

export function SynergizeDialog({ project }: SynergizeDialogProps) {
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    motivation: "",
    skills: "",
    contribution: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendApplication = () => {
    // Validasi sederhana
    if (applicationData.motivation && applicationData.skills && applicationData.contribution) {
      console.log(`Mengirim aplikasi untuk proyek "${project.title}":`, applicationData);
      setApplicationData({ motivation: "", skills: "", contribution: "" });
      // Di sini bisa ditambahkan logika menutup dialog dan menampilkan notifikasi
    } else {
      alert("Harap isi semua kolom.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1 bg-gradient-to-r from-[#0088FF] to-[#CB30E0] hover:brightness-90">
          <Zap className="h-4 w-4 mr-2" />
          Synergize It!
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0">
        <div className="p-6">
          <div className="mb-6">
            <DialogTitle className="text-lg font-semibold mb-2">Bergabung dengan Proyek</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Ajukan diri Anda untuk bergabung dengan "{project.title}"
            </DialogDescription>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-8 w-8"><AvatarImage src={project.recruiter.avatar} /><AvatarFallback>{project.recruiter.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
              <span className="text-sm font-medium">{project.recruiter.name}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {project.skills.slice(0, 4).map((skill) => <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>)}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Role apa yang ingin anda isi?</label>
              <Textarea name="role" placeholder="Jelaskan role yang ingin anda isi..." value={applicationData.role} onChange={handleInputChange} className="min-h-[80px] resize-none"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mengapa Anda tertarik dengan proyek ini?</label>
              <Textarea name="motivation" placeholder="Jelaskan motivasi dan ketertarikan Anda..." value={applicationData.motivation} onChange={handleInputChange} className="min-h-[80px] resize-none"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Skill dan pengalaman relevan</label>
              <Textarea name="skills" placeholder="Ceritakan skill dan pengalaman yang mendukung..." value={applicationData.skills} onChange={handleInputChange} className="min-h-[80px] resize-none"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kontribusi yang bisa Anda berikan</label>
              <Textarea name="contribution" placeholder="Apa yang bisa Anda kontribusikan untuk proyek ini..." value={applicationData.contribution} onChange={handleInputChange} className="min-h-[80px] resize-none"/>
            </div>
            <Button onClick={handleSendApplication} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Zap className="h-4 w-4 mr-2" />
              Kirim Aplikasi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}