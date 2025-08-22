"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Project } from '@/types';

interface ChatDialogProps {
  project: Project;
  onChatStart?: () => void; // Callback to trigger chat bubble opening
}

export function ChatDialog({ project, onChatStart }: ChatDialogProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) {
      toast.error("Pesan tidak boleh kosong");
      return;
    }

    // Get auth data from localStorage
    const getAuthData = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        if (!token || !user) {
          throw new Error('Authentication required');
        }
        
        return { token, user };
      } catch (error) {
        throw new Error('Please login first');
      }
    };

    try {
      setIsLoading(true);
      const authData = getAuthData();

      // Check if user is trying to chat with themselves
      if (authData.user.id === project.creator.id) {
        toast.error("Anda tidak dapat mengirim pesan kepada diri sendiri");
        return;
      }

      // Step 1: Get or create chat with the project creator
      const chatResponse = await api.getChatWithUser(authData.token, project.creator.id);
      
      if (!chatResponse.success || !chatResponse.data) {
        throw new Error('Gagal membuat chat');
      }

      const chat = chatResponse.data;

      // Step 2: Send the initial message via WebSocket
      // We'll dispatch a custom event that the chat bubble can listen to
      const messageData = {
        type: 'send_initial_message',
        chatId: chat.id,
        creatorId: project.creator.id,
        creatorName: project.creator.name,
        creatorAvatar: project.creator.profile?.profile_picture || '',
        message: chatMessage.trim(),
        projectTitle: project.title
      };

      // Dispatch custom event for chat bubble to handle
      window.dispatchEvent(new CustomEvent('startChat', {
        detail: messageData
      }));

      // Clear message and close dialog
      setChatMessage("");
      
      // Call onChatStart callback to trigger chat bubble opening
      onChatStart?.();

      toast.success(`Pesan terkirim ke ${project.creator.name}`);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || "Gagal mengirim pesan");
    } finally {
      setIsLoading(false);
    }
  };

  const setQuickMessage = (message: string) => {
    setChatMessage(message);
  };

  // Map API data to display format
  const creatorProfile = project.creator.profile;
  const creatorAvatar = creatorProfile?.profile_picture || '';
  const creatorRole = creatorProfile?.interests || 'Project Creator';

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
                Tanyakan detail proyek kepada {project.creator.name}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarImage src={creatorAvatar} />
              <AvatarFallback>{project.creator.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{project.creator.name}</p>
              <p className="text-sm text-gray-600">{creatorRole}</p>
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
            <Textarea 
              placeholder="Tulis pesan Anda..." 
              value={chatMessage} 
              onChange={(e) => setChatMessage(e.target.value)} 
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={isLoading || !chatMessage.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Mengirim...' : 'Kirim Pesan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}