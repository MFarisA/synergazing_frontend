"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  LinkIcon,
  Users,
  Eye,
  FileText,
  Github,
  Linkedin,
  Instagram,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedModal } from "@/components/ui/animated-modal";
import { api } from "@/lib/api";
import { useWebSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { User, Project } from "@/types";
import { getProfile } from "@/lib/api/profile-management";
import { getUserProfile } from "@/lib/api/profile-management";
import { getCreatedProjects } from "@/lib/api/project-management";
import { getChatWithUser, getChatMessages } from "@/lib/api/chat-message";
import { getCollaborators } from "@/lib/api/collaboration";

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

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [userData, setUserData] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chat state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // WebSocket
  const { connectionStatus, lastMessage, connect, disconnect, sendMessage } = useWebSocket();

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if viewing own profile
  const isOwnProfile = currentUser && userData && currentUser.id === userData.id;

  useEffect(() => {
    // Get current user info from token
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
              // Check if message already exists to avoid duplicates
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
        default:
          console.log('Unknown message type:', lastMessage.type);
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

  // Initialize chat when user wants to contact
  const initializeChat = async () => {
    if (!userData) return;
    
    try {
      setIsLoadingChat(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get or create chat with the user
      const chatResponse = await getChatWithUser(token, userData.id);
      console.log('Chat response:', chatResponse);

      if (chatResponse.success && chatResponse.data) {
        const chat = chatResponse.data;
        setCurrentChat(chat);

        // Load messages for this chat
        const messagesResponse = await getChatMessages(token, chat.id);
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
      }
    } catch (err) {
      console.error('Error initializing chat:', err);
      setApiError('Failed to initialize chat');
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
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle contact button click
  const handleContactUser = async () => {
    await initializeChat();
    setIsMessageModalOpen(true);
  };

  // Close chat modal
  const handleCloseChat = () => {
    setIsMessageModalOpen(false);
    setCurrentChat(null);
    setChatMessages([]);
    setNewMessage("");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setApiError("Please log in to view profiles");
        setIsLoading(false);
        return;
      }

      try {
        // If viewing own profile, use the regular profile endpoint
        if (currentUser && parseInt(userId) === currentUser.id) {
          const [profileData, projectsResponse] = await Promise.all([
            getProfile(token),
            getCreatedProjects(token),
          ]);

          if (profileData) {
            const profileInfo = profileData.data.profile || {};
            const directSkills = profileData.data.skills || [];
            const collaborationStatus = profileData.data.colaboration_status === "ready";

            const updatedProfileData = {
              ...profileData.data,
              about_me: profileInfo.about_me || "",
              academic: profileInfo.academic || "",
              location: profileInfo.location || "",
              interests: profileInfo.interests || "",
              website_url: profileInfo.website_url || "",
              github_url: profileInfo.github_url || "",
              linkedin_url: profileInfo.linkedin_url || "",
              instagram_url: profileInfo.instagram_url || "",
              portfolio_url: profileInfo.portfolio_url || "",
              collaboration_status: collaborationStatus,
              user_skills: directSkills,
            };
            setUserData(updatedProfileData);
            setUserProjects(projectsResponse?.data || []);
          }
        } else {
          // For other users, use the direct profile endpoint
          try {
            const userProfileResponse = await getUserProfile(token, userId);
            console.log('User profile API response:', userProfileResponse);
            
            if (userProfileResponse.success && userProfileResponse.data) {
              const userData = userProfileResponse.data;
              
              // Transform user data to match User interface, handling both field name variations
              const transformedUser = {
                id: userData.id,
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
                profile_picture: userData.profile_picture || "",
                about_me: userData.about_me || "",
                location: userData.location || "",
                interests: userData.interests || "",
                academic: userData.academic || "",
                website_url: userData.website_url || "",
                github_url: userData.github_url || "",
                linkedin_url: userData.linkedin_url || "",
                instagram_url: userData.instagram_url || "",
                portfolio_url: userData.portfolio_url || userData.portofolio_url || "", // Handle both spellings
                cv_file: userData.cv_file || "", // Available in direct profile endpoint
                collaboration_status: true, // User is ready since they're accessible via this endpoint
                user_skills: userData.skills || [],
              };
              
              console.log('Transformed user data:', transformedUser);
              setUserData(transformedUser);
              setUserProjects([]); // Don't load projects for other users for privacy
            } else {
              throw new Error("User profile data not found");
            }
          } catch (directProfileError) {
            console.error('Failed to get direct profile, falling back to collaborators list:', directProfileError);
            
            // Fallback: try to get user info from collaborators list
            const collaboratorsResponse = await getCollaborators(token);
            
            let collaboratorsData = [];
            if (collaboratorsResponse.data && collaboratorsResponse.data.users) {
              collaboratorsData = collaboratorsResponse.data.users;
            } else if (collaboratorsResponse.data && Array.isArray(collaboratorsResponse.data)) {
              collaboratorsData = collaboratorsResponse.data;
            } else if (Array.isArray(collaboratorsResponse)) {
              collaboratorsData = collaboratorsResponse;
            }

            const targetUser = collaboratorsData.find((user: {
              id: number;
              name: string;
              email?: string;
              phone?: string;
              profile_picture?: string;
              about_me?: string;
              location?: string;
              interests?: string;
              academic?: string;
              website_url?: string;
              github_url?: string;
              linkedin_url?: string;
              instagram_url?: string;
              portfolio_url?: string;
              portofolio_url?: string; // Handle both spellings
              skills?: any[];
            }) => user.id === parseInt(userId));
            
            if (targetUser) {
              // Transform collaborator data to match User interface
              const transformedUser = {
                id: targetUser.id,
                name: targetUser.name,
                email: targetUser.email || "",
                phone: targetUser.phone || "",
                profile_picture: targetUser.profile_picture || "",
                about_me: targetUser.about_me || "",
                location: targetUser.location || "",
                interests: targetUser.interests || "",
                academic: targetUser.academic || "",
                website_url: targetUser.website_url || "",
                github_url: targetUser.github_url || "",
                linkedin_url: targetUser.linkedin_url || "",
                instagram_url: targetUser.instagram_url || "",
                portfolio_url: targetUser.portfolio_url || targetUser.portofolio_url || "", // Handle both spellings
                cv_file: "", // Not available for other users in collaborators endpoint
                collaboration_status: true, // They're in collaborators list, so they're ready
                user_skills: targetUser.skills || [],
              };
              setUserData(transformedUser);
              setUserProjects([]); // Don't load projects for other users for privacy
            } else {
              throw new Error("User not found in collaborators list");
            }
          }
        }
        setApiError(null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setApiError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser !== null) {
      fetchUserProfile();
    }
  }, [userId, currentUser]);

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

  if (!userData && apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Profil Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-4">{apiError}</p>
          <Link href="/collaborators">
            <Button>Kembali ke Kolaborator</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* API Error Notification */}
      {apiError && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">{apiError}</span>
              </div>
              <button
                onClick={() => setApiError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar Section */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                      <AvatarImage
                        src={userData.profile_picture || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-2xl">
                        {userData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl font-bold">{userData.name}</h1>
                    <p className="text-muted-foreground">
                      {userData.interests}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4" />
                        <span>{userData.academic}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{userData.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Section */}
                  <div className="w-full sm:w-auto">
                    {isOwnProfile ? (
                      <Link href="/profile/edit">
                        <Button className="w-full sm:w-auto">
                          Edit Profil
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button
                          className="w-full sm:w-auto"
                          onClick={handleContactUser}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Hubungi
                        </Button>
                        <Link href="/collaborators">
                          <Button variant="outline" className="w-full sm:w-auto">
                            Kembali ke Kolaborator
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collaboration Status - Only show for own profile or if user is ready */}
                {(isOwnProfile || userData.collaboration_status) && (
                  <div className="flex items-center justify-between p-3 mt-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">
                        {isOwnProfile 
                          ? "Siap untuk Kolaborasi (#ReadyToSynergize)"
                          : "Siap untuk Kolaborasi (#ReadyToSynergize)"
                        }
                      </h4>
                      <p className="text-xs text-gray-500">
                        {isOwnProfile 
                          ? "Tampilkan profil Anda apakah bersedia menjadi kolaborator."
                          : "Pengguna ini siap untuk berkolaborasi."
                        }
                      </p>
                    </div>
                    {!isOwnProfile && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Ready
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {isOwnProfile && <TabsTrigger value="projects">Proyek</TabsTrigger>}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tentang {isOwnProfile ? 'Saya' : userData.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {userData.about_me || "Tidak ada deskripsi tersedia."}
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
                      {userData.user_skills && userData.user_skills.length > 0 ? (
                        userData.user_skills.map((userSkill) => (
                          <Badge
                            key={userSkill.id}
                            variant="secondary"
                            className="p-2"
                          >
                            {userSkill.skill.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Tidak ada skill yang ditambahkan.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projects tab - only for own profile */}
              {isOwnProfile && (
                <TabsContent value="projects" className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold">
                      Proyek Saya ({userProjects.length})
                    </h2>
                    <Link href="/create-project">
                      <Button className="w-full sm:w-auto">
                        Buat Proyek Baru
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
                    {userProjects.length === 0 ? (
                      <div className="col-span-full text-center text-gray-500 py-10">
                        Anda belum membuat proyek apa pun.
                      </div>
                    ) : (
                      userProjects.map((project) => (
                        <Card
                          key={project.id}
                          className="hover:shadow-lg transition-all duration-200 flex flex-col"
                        >
                          <div className="relative">
                            <img
                              src={
                                project.picture_url ||
                                "/placeholder.svg?height=200&width=300&text=Project"
                              }
                              alt={project.title}
                              className="w-full h-36 sm:h-40 md:h-44 lg:h-48 object-cover rounded-t-lg"
                            />
                            <Badge
                              className={`absolute top-2 left-2 text-xs ${
                                project.status === "published"
                                  ? "bg-blue-500"
                                  : project.status === "draft"
                                  ? "bg-yellow-500"
                                  : project.status === "completed"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }`}
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <CardHeader className="pb-2 px-3 sm:px-6">
                            <CardTitle className="text-base sm:text-lg line-clamp-2">
                              {project.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-sm">
                              {project.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 flex-1 flex flex-col">
                            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                              <span className="truncate mr-2">
                                Role: <span className="font-medium">Project Creator</span>
                              </span>
                              <span className="text-nowrap">
                                {project.filled_team + 1}/{project.total_team} anggota
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {project.required_skills
                                .slice(0, 3)
                                .map((skillItem) => (
                                  <Badge
                                    key={skillItem.skill.id}
                                    variant="outline"
                                    className="text-xs px-2 py-1"
                                  >
                                    {skillItem.skill.name}
                                  </Badge>
                                ))}
                              {project.required_skills.length > 3 && (
                                <Badge variant="outline" className="text-xs px-2 py-1">
                                  +{project.required_skills.length - 3}
                                </Badge>
                              )}
                            </div>

                            <div className="flex gap-2 mt-auto">
                              <Link
                                href={`/projects/${project.id}`}
                                className="flex-1"
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full bg-transparent text-xs sm:text-sm h-8 sm:h-9"
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
                                  Detail
                                </Button>
                              </Link>
                              <Link
                                href={`/recruiter-dashboard?projectId=${project.id}`}
                                className="flex-1"
                              >
                                <Button size="sm" className="w-full text-xs sm:text-sm h-8 sm:h-9">
                                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
                                  Pelamar
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info - Show limited info for other users */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(isOwnProfile || userData.email) && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">
                        {isOwnProfile ? userData.email : (userData.email || "Tidak tersedia")}
                      </p>
                    </div>
                  </div>
                )}
                {(isOwnProfile || userData.phone) && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Telepon</p>
                      <p className="text-sm text-gray-600">
                        {isOwnProfile ? userData.phone : (userData.phone || "Tidak tersedia")}
                      </p>
                    </div>
                  </div>
                )}
                {!isOwnProfile && !userData.email && !userData.phone && (
                  <p className="text-sm text-gray-500">
                    Informasi kontak tidak tersedia untuk umum.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Media Sosial & Tautan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userData.website_url && (
                  <a
                    href={userData.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LinkIcon className="h-5 w-5" />
                    <span className="text-sm">Website</span>
                    <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                  </a>
                )}
                {userData.github_url && (
                  <a
                    href={userData.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Github className="h-5 w-5" />
                    <span className="text-sm">GitHub</span>
                    <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                  </a>
                )}
                {userData.linkedin_url && (
                  <a
                    href={userData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">LinkedIn</span>
                    <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                  </a>
                )}
                {userData.instagram_url && (
                  <a
                    href={userData.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <span className="text-sm">Instagram</span>
                    <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                  </a>
                )}
                {userData.portfolio_url && (
                  <a
                    href={userData.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LinkIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Portfolio</span>
                    <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                  </a>
                )}
                {!userData.website_url && !userData.github_url && !userData.linkedin_url && 
                 !userData.instagram_url && !userData.portfolio_url && (
                  <p className="text-sm text-gray-500">
                    Tidak ada tautan media sosial yang tersedia.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* CV Section - Show for all users if they have a CV */}
            {userData.cv_file && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>CV / Resume</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {userData.cv_file.split("/").pop()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isOwnProfile ? "CV Anda" : `CV ${userData.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setIsPdfViewerOpen(true)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Lihat CV
                      </Button>
                      {!isOwnProfile && (
                        <a
                          href={userData.cv_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            className="w-full"
                          >
                            <FileText className="h-4 w-4 mr-2" /> Download
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CV Section - Only show upload option for own profile without CV */}
            {isOwnProfile && !userData.cv_file && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>CV / Resume</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      Upload CV Anda untuk meningkatkan peluang kolaborasi
                    </p>
                    <Link href="/profile/edit">
                      <Button size="sm">Upload CV</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer Dialog - Available for all users when CV exists */}
      {userData.cv_file && (
        <Dialog open={isPdfViewerOpen} onOpenChange={setIsPdfViewerOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>CV Preview: {userData.cv_file?.split("/").pop()}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPdfViewerOpen(false)}
                >
                  Close
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <div className="bg-gray-50 rounded-lg border border-gray-200 h-[75vh]">
                {userData.cv_file ? (
                  <iframe
                    src={`${userData.cv_file}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-0 rounded-lg"
                    title="CV Preview"
                    onError={(e) => {
                      console.error("PDF preview error:", e);
                      window.open(userData.cv_file, "_blank");
                      setIsPdfViewerOpen(false);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">CV tidak tersedia</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Chat Modal */}
      {userData && (
        <AnimatedModal
          isOpen={isMessageModalOpen}
          onClose={handleCloseChat}
          showCloseButton={false}
          className="max-w-lg h-[600px]"
        >
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userData.profile_picture || "/placeholder.svg"} />
                  <AvatarFallback>
                    {userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {userData.name}
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
                      <p>Mulai percakapan dengan {userData.name}</p>
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
                              <AvatarImage src={userData.profile_picture || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {userData.name.charAt(0)}
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
  );
}