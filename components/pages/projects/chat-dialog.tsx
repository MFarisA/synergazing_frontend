"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import type { Project } from '@/types';

interface ChatDialogProps {
  project: Project;
}

export function ChatDialog({ project }: ChatDialogProps) {
  const [chatMessage, setChatMessage] = useState("");

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Di aplikasi nyata, di sini Anda akan memanggil API untuk mengirim pesan
      console.log(`Mengirim pesan ke ${project.recruiter.name}:`, chatMessage);
      setChatMessage("");
      // Mungkin tambahkan notifikasi toast "Pesan terkirim!"
    }
  };

  const setQuickMessage = (message: string) => {
    setChatMessage(message);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <DialogTitle className="text-lg font-semibold">Chat dengan Recruiter</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Tanyakan detail proyek kepada {project.recruiter.name}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarImage src={project.recruiter.avatar} />
              <AvatarFallback>{project.recruiter.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{project.recruiter.name}</p>
              <p className="text-sm text-gray-600">{project.recruiter.major} - {project.recruiter.university}</p>
            </div>
          </div>
          <div className="mb-6">
            <p className="font-medium mb-3">Pertanyaan Cepat:</p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto p-3" onClick={() => setQuickMessage("Bisa dijelaskan lebih detail tentang proyek ini?")}>Bisa dijelaskan lebih detail tentang proyek ini?</Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto p-3" onClick={() => setQuickMessage("Skill apa yang paling dibutuhkan?")}>Skill apa yang paling dibutuhkan?</Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto p-3" onClick={() => setQuickMessage("Bagaimana timeline dan sistem kerjanya?")}>Bagaimana timeline dan sistem kerjanya?</Button>
            </div>
          </div>
          <div className="space-y-3">
            <Textarea placeholder="Tulis pesan Anda..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} className="min-h-[80px] resize-none" />
            <Button onClick={handleSendMessage} className="w-full bg-black hover:bg-gray-800 text-white">
              <Send className="h-4 w-4 mr-2" />
              Kirim Pesan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}