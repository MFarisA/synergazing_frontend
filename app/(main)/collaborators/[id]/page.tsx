"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MapPin, Mail, Phone, ExternalLink, Github, MessageCircle, Users, Send, X } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWebSocket } from "@/lib/socket"
import { AnimatedModal } from "@/components/ui/animated-modal"
import { cn } from "@/lib/utils"

interface CollaboratorProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profile?: {
    profile_picture?: string;
    about_me?: string;
    location?: string;
    interests?: string;
    academic?: string;
    portfolio?: string;
    github?: string;
  };
  user_skills?: Array<{
    id: number;
    skill: {
      id: number;
      name: string;
    };
    proficiency: number;
  }>;
}

// Chat message interface
interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: number;
    name: string;
  };
}

// Chat interface
interface Chat {
  id: number;
  user1_id: number;
  user2_id: number;
  created_at: string;
  updated_at: string;
}

export default function CollaboratorProfilePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = params.id as string
  const fromRecruiter = searchParams.get('from') === 'recruiter'
  const projectId = searchParams.get('projectId')
  
  const [collaborator, setCollaborator] = useState<CollaboratorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  // Chat state
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null)

  // WebSocket
  const { connectionStatus, lastMessage, connect, disconnect, sendMessage } = useWebSocket()

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCollaborator = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view profile");
          return;
        }

        // For now, we'll fetch from collaborators list and find the specific user
        // In a real app, you'd have a dedicated API endpoint for individual user profiles
        const response = await api.getCollaborators(token);
        
        let collaboratorsData;
        if (response.data && response.data.users) {
          collaboratorsData = response.data.users;
        } else if (response.data && Array.isArray(response.data)) {
          collaboratorsData = response.data;
        } else if (Array.isArray(response)) {
          collaboratorsData = response;
        } else {
          collaboratorsData = [];
        }

        const user = collaboratorsData.find((c: any) => c.id.toString() === userId);
        
        if (user) {
          setCollaborator({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profile: {
              profile_picture: user.profile?.profile_picture,
              about_me: user.profile?.about_me,
              location: user.profile?.location,
              interests: user.profile?.interests,
              academic: user.profile?.academic,
              portfolio: user.profile?.portfolio,
              github: user.profile?.github,
            },
            user_skills: user.user_skills || []
          });
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error('Error fetching collaborator:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollaborator();
  }, [userId]);

  // Get current user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({ id: payload.user_id, name: payload.name || 'You' });
        
        // Connect to WebSocket
        connect(payload.user_id, token);
      } catch (err) {
        console.error('Failed to decode token:', err);
      }
    }
  }, [connect]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'new_message':
          if (lastMessage.data && currentChat && lastMessage.data.chat_id === currentChat.id) {
            setChatMessages(prev => {
              const messageData = lastMessage.data as unknown as ChatMessage;
              const exists = prev.some(msg => msg.id === messageData.id);
              if (exists) return prev;
              
              return [...prev, messageData];
            });
          }
          break;
        case 'connected':
          console.log('WebSocket connected successfully');
          break;
        case 'error':
          console.error('WebSocket error:', lastMessage.data?.error);
          break;
      }
    }
  }, [lastMessage, currentChat]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const handleChatWithUser = async () => {
    if (!collaborator) return;
    
    try {
      setIsLoadingChat(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to chat with other users");
        return;
      }

      // Get or create chat with the collaborator
      const chatResponse = await api.getChatWithUser(token, collaborator.id);
      console.log('Chat response:', chatResponse);

      if (chatResponse.success && chatResponse.data) {
        const chat = chatResponse.data;
        setCurrentChat(chat);

        // Load messages for this chat
        const messagesResponse = await api.getChatMessages(token, chat.id);
        console.log('Messages response:', messagesResponse);

        if (messagesResponse.success && messagesResponse.data) {
          setChatMessages(messagesResponse.data.messages || []);
        }

        // Join chat via WebSocket
        if (connectionStatus === 'connected') {
          sendMessage({
            type: 'join_chat',
            chat_id: chat.id
          });
        }

        // Open chat modal
        setIsChatModalOpen(true);

        toast.success(`Chat with ${collaborator.name} is now available`);
      } else {
        throw new Error(chatResponse.message || "Failed to start chat");
      }
    } catch (error: any) {
      console.error("Error starting chat:", error);
      toast.error(error.message || "Failed to start chat. Please try again.");
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Send message function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || isSendingMessage) return;

    try {
      setIsSendingMessage(true);

      // Send via WebSocket
      const success = sendMessage({
        type: 'send_message',
        chat_id: currentChat.id,
        content: newMessage.trim()
      });

      if (success) {
        setNewMessage("");
      } else {
        throw new Error('Failed to send message via WebSocket');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Close chat modal
  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setCurrentChat(null);
    setChatMessages([]);
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-blue-600 border-blue-200 rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-sm text-gray-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (error || !collaborator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profil Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href={fromRecruiter && projectId ? `/recruiter-dashboard?projectId=${projectId}` : "/collaborators"}>
            <Button>
              {fromRecruiter ? "Kembali ke Project Recruiter" : "Kembali ke Kolaborator"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <Link href={fromRecruiter && projectId ? `/recruiter-dashboard?projectId=${projectId}` : "/collaborators"}>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="text-sm text-gray-500">
              {fromRecruiter ? "Kembali ke Project Recruiter" : "Kembali ke Kolaborator"}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header Card */}
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={collaborator.profile?.profile_picture || "/placeholder.svg"} alt={collaborator.name} />
                      <AvatarFallback className="text-4xl">
                        {collaborator.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h1 className="text-3xl font-bold mb-2">{collaborator.name}</h1>
                      <p className="text-lg text-gray-600 mb-3">{collaborator.profile?.interests || "Gamer"}</p>
                      
                      <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Teknik In, UIND</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{collaborator.profile?.location || "Semarang, Indonesia"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col gap-3">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleChatWithUser}
                        disabled={isLoadingChat}
                      >
                        {isLoadingChat ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Menghubungkan...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Hubungi
                          </>
                        )}
                      </Button>
                      <Link href={fromRecruiter && projectId ? `/recruiter-dashboard?projectId=${projectId}` : "/collaborators"}>
                        <Button variant="outline" className="w-full">
                          {fromRecruiter ? "Kembali ke Project Recruiter" : "Kembali ke Kolaborator"}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm text-green-800">
                          Siap untuk Kolaborasi (#ReadyToSynergize)
                        </h4>
                        <p className="text-xs text-green-600">
                          Pengguna ini siap untuk berkolaborasi.
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Ready
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs Content */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* About */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tentang {collaborator.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {collaborator.profile?.about_me || "Saya ganteng"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills & Keahlian</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {(collaborator.user_skills || []).map((userSkill) => (
                          <Badge key={userSkill.id} variant="secondary" className="text-sm">
                            {userSkill.skill.name}
                          </Badge>
                        ))}
                        {(!collaborator.user_skills || collaborator.user_skills.length === 0) && (
                          <p className="text-sm text-gray-500">Belum ada skill yang ditambahkan</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kontak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{collaborator.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Telepon</p>
                      <p className="text-sm text-gray-600">
                        {collaborator.phone || "Informasi kontak tidak tersedia untuk umum."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Media Sosial & Tautan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {collaborator.profile?.github ? (
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Github</p>
                        <a 
                          href={collaborator.profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Github <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Github</p>
                        <p className="text-sm text-gray-500">Belum ada tautan media sosial.</p>
                      </div>
                    </div>
                  )}
                  
                  {collaborator.profile?.portfolio && (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Portfolio</p>
                        <a 
                          href={collaborator.profile.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Portfolio <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Academic Info */}
              {collaborator.profile?.academic && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Akademik</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{collaborator.profile.academic}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {collaborator && (
        <AnimatedModal
          isOpen={isChatModalOpen}
          onClose={handleCloseChat}
          showCloseButton={false}
          className="max-w-lg h-[600px]"
        >
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={collaborator.profile?.profile_picture || "/placeholder.svg"} />
                  <AvatarFallback>
                    {collaborator.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {collaborator.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseChat}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {isLoadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-t-blue-600 border-blue-200 rounded-full animate-spin mb-2 mx-auto"></div>
                    <p className="text-sm text-gray-500">Memuat percakapan...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Mulai percakapan dengan {collaborator.name}</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => {
                      const isSent = currentUser && message.sender_id === currentUser.id;
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex items-end gap-2",
                            isSent ? "justify-end" : "justify-start"
                          )}
                        >
                          {!isSent && (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={collaborator.profile?.profile_picture || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {collaborator.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex flex-col max-w-xs">
                            <div
                              className={cn(
                                "px-3 py-2 rounded-lg text-sm shadow-sm",
                                isSent
                                  ? "bg-blue-500 text-white rounded-br-sm"
                                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm"
                              )}
                            >
                              {message.content}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-3">
                              {new Date(message.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1"
                  disabled={connectionStatus !== 'connected' || isSendingMessage}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!newMessage.trim() || connectionStatus !== 'connected' || isSendingMessage}
                >
                  {isSendingMessage ? (
                    <div className="w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              {connectionStatus !== 'connected' && (
                <p className="text-xs text-red-500 mt-2">
                  Koneksi terputus. Mencoba menyambung kembali...
                </p>
              )}
            </div>
          </div>
        </AnimatedModal>
      )}
    </div>
  )
}