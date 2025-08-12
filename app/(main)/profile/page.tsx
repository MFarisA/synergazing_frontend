"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Mail, Phone, MapPin, Briefcase, GraduationCap, LinkIcon, Edit, Users, MessageCircle, Plus, Eye, Download, FileText, Upload, File, Camera, Github, Linkedin, Instagram } from 'lucide-react'
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { User, Skill, UserSkill } from "@/types"

// Mock data for projects (copied from app/recruiter-dashboard/page.tsx for consistency)
const allProjectsData = [
  {
    id: "1",
    title: "AI-Powered Content Generator",
    description: "Develop a web application that uses AI to generate engaging content for various platforms.",
    skills: ["Python", "TensorFlow", "React", "Next.js", "NLP"],
    teamSize: 5,
    duration: "3 months",
    location: "Remote",
    status: "In Progress", // Changed for demo
    recruiterId: 1, // Assuming user with id 1 (Adit Cukur) is the recruiter
    completion: 75,
    role: "Project Lead",
    technologies: ["React", "Node.js", "Arduino", "MongoDB"],
  },
  {
    id: "2",
    title: "E-commerce Platform Redesign",
    description: "Revamp an existing e-commerce website with a modern UI/UX and improved performance.",
    skills: ["React", "Node.js", "MongoDB", "UI/UX", "Figma"],
    teamSize: 4,
    duration: "2 months",
    location: "Hybrid (Jakarta)",
    status: "Completed",
    recruiterId: 1, // Assuming user with id 1 (Adit Cukur) is the recruiter
    completion: 100,
    role: "Full-Stack Developer",
    technologies: ["Vue.js", "Laravel", "MySQL"],
  },
  {
    id: "3",
    title: "Mobile Fitness Tracker App",
    description:
      "Build a cross-platform mobile application to track fitness activities and provide personalized workout plans.",
    skills: ["React Native", "Firebase", "TypeScript", "Health API"],
    teamSize: 3,
    duration: "4 months",
    location: "Remote",
    status: "Open",
    recruiterId: 2, // Another recruiter
    completion: 0,
    role: "Mobile Developer",
    technologies: ["React Native", "Firebase", "TensorFlow"],
  },
]

export default function ProfilePage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [activeTab, setActiveTab] = useState("overview")
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false)
  const [skillToEdit, setSkillToEdit] = useState<UserSkill | null>(null);
  const [newSkill, setNewSkill] = useState({ name: "", proficiency: 75 });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      Promise.all([
        api.getProfile(token).catch(err => {
          console.error("Failed to fetch profile:", err);
          setApiError("Gagal memuat profil. Backend mungkin tidak tersedia.");
          return null;
        }),
        api.getAllSkills(token).catch(err => {
          console.error("Failed to fetch skills:", err);
          return { data: { skills: [] } };
        }),
        api.getUserSkills(token).catch(err => {
          console.error("Failed to fetch user skills:", err);
          return { data: { skills: [] } };
        })
      ]).then(([profileData, skillsData, userSkillsData]) => {
        if (profileData) {
          // The profile API returns profile details nested under 'profile' object
          // and skills directly under 'skills' array
          const profileInfo = profileData.data.profile || {};
          const directSkills = profileData.data.skills || [];
          
          // Merge profile data with nested profile information
          const updatedProfileData = {
            ...profileData.data,
            // Flatten profile information to the root level
            about_me: profileInfo.about_me || "",
            academic: profileInfo.academic || "",
            location: profileInfo.location || "",
            interests: profileInfo.interests || "",
            website_url: profileInfo.website_url || "",
            github_url: profileInfo.github_url || "",
            linkedin_url: profileInfo.linkedin_url || "",
            instagram_url: profileInfo.instagram_url || "",
            portfolio_url: profileInfo.portfolio_url || "",
            // Set default collaboration_status if not provided
            collaboration_status: profileData.data.collaboration_status ?? false,
            // Use skills from profile API if available, otherwise use getUserSkills data
            user_skills: directSkills.length > 0 ? directSkills : (userSkillsData?.data?.skills || [])
          };
          setUserData(updatedProfileData);
        }
        setAllSkills(skillsData?.data?.skills || []);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleCollaborationStatusChange = async (status: boolean) => {
    const token = localStorage.getItem("token");
    if (token && userData) {
      try {
        await api.updateCollaborationStatus(token, status);
        setUserData({ ...userData, collaboration_status: status });
        setApiError(null);
      } catch (error) {
        console.error(error);
        setApiError("Gagal mengubah status kolaborasi. Coba lagi nanti.");
      }
    }
  };

  const handleDeletePicture = async () => {
    const token = localStorage.getItem("token");
    if (token && userData) {
      try {
        await api.deleteProfilePicture(token);
        setUserData({ ...userData, profile_picture: "" });
        setApiError(null);
      } catch (error) {
        console.error(error);
        setApiError("Gagal menghapus foto profil. Coba lagi nanti.");
      }
    }
  }

  const handleDeleteCv = async () => {
    const token = localStorage.getItem("token");
    if (token && userData) {
      try {
        await api.deleteCv(token);
        setUserData({ ...userData, cv_file: "" });
        setApiError(null);
      } catch (error) {
        console.error(error);
        setApiError("Gagal menghapus CV. Coba lagi nanti.");
      }
    }
  }

  const handleAddOrUpdateSkill = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userData) return;

    const skillExists = allSkills.find(skill => skill.name.toLowerCase() === newSkill.name.toLowerCase());
    
    // Initialize with empty array if user_skills is undefined
    let skillsToUpdate = [...(userData.user_skills || []).map(us => ({
      skill_name: us.skill.name,
      proficiency: us.proficiency,
    }))];

    if (skillToEdit) { // Editing existing skill
      skillsToUpdate = skillsToUpdate.map(s => s.skill_name === skillToEdit.skill.name ? { skill_name: newSkill.name, proficiency: newSkill.proficiency } : s);
    } else { // Adding new skill
      skillsToUpdate.push({ skill_name: newSkill.name, proficiency: newSkill.proficiency });
    }
    
    console.log('Skills to update:', skillsToUpdate);
    
    try {
      await api.updateUserSkills(token, skillsToUpdate);
      
      // Refresh both profile and user skills
      const [updatedProfile, updatedUserSkills] = await Promise.all([
        api.getProfile(token),
        api.getUserSkills(token)
      ]);
      
      // Handle the nested profile structure
      const profileInfo = updatedProfile.data.profile || {};
      const directSkills = updatedProfile.data.skills || [];
      
      // Merge profile data with nested profile information
      const updatedProfileData = {
        ...updatedProfile.data,
        about_me: profileInfo.about_me || "",
        academic: profileInfo.academic || "",
        location: profileInfo.location || "",
        interests: profileInfo.interests || "",
        website_url: profileInfo.website_url || "",
        github_url: profileInfo.github_url || "",
        linkedin_url: profileInfo.linkedin_url || "",
        instagram_url: profileInfo.instagram_url || "",
        portfolio_url: profileInfo.portfolio_url || "",
        collaboration_status: updatedProfile.data.collaboration_status ?? false,
        user_skills: directSkills.length > 0 ? directSkills : (updatedUserSkills?.data?.skills || [])
      };
      setUserData(updatedProfileData);
      
      setIsSkillDialogOpen(false);
      setNewSkill({ name: "", proficiency: 75 });
      setSkillToEdit(null);
      setApiError(null);
    } catch (error) {
      console.error(error);
      setApiError("Gagal mengubah skill. Coba lagi nanti.");
    }
  };

  const handleDeleteSkill = async (skillName: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await api.deleteUserSkill(token, skillName);
      
      // Refresh both profile and user skills
      const [updatedProfile, updatedUserSkills] = await Promise.all([
        api.getProfile(token),
        api.getUserSkills(token)
      ]);
      
      // Handle the nested profile structure
      const profileInfo = updatedProfile.data.profile || {};
      const directSkills = updatedProfile.data.skills || [];
      
      // Merge profile data with nested profile information
      const updatedProfileData = {
        ...updatedProfile.data,
        about_me: profileInfo.about_me || "",
        academic: profileInfo.academic || "",
        location: profileInfo.location || "",
        interests: profileInfo.interests || "",
        website_url: profileInfo.website_url || "",
        github_url: profileInfo.github_url || "",
        linkedin_url: profileInfo.linkedin_url || "",
        instagram_url: profileInfo.instagram_url || "",
        portfolio_url: profileInfo.portfolio_url || "",
        collaboration_status: updatedProfile.data.collaboration_status ?? false,
        user_skills: directSkills.length > 0 ? directSkills : (updatedUserSkills?.data?.skills || [])
      };
      setUserData(updatedProfileData);
      
      setIsSkillDialogOpen(false);
      setApiError(null);
    } catch (error) {
      console.error(error);
      setApiError("Gagal menghapus skill. Coba lagi nanti.");
    }
  };

  // Filter projects created by this user
  const userProjects = userData ? allProjectsData.filter((project) => project.recruiterId === userData.id) : [];
  const completedUserProjects = userProjects.filter((project) => project.status === "Completed").length;

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
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tidak Dapat Memuat Profil</h2>
          <p className="text-gray-600 mb-4">{apiError}</p>
          <Button onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen">
      {/* API Error Notification */}
      {apiError && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{apiError}</span>
              </div>
              <button
                onClick={() => setApiError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
                      <AvatarImage src={userData.profile_picture || "/placeholder.svg"} />
                      <AvatarFallback className="text-2xl">
                        {userData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Link href="/profile/edit">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl font-bold">{userData.name}</h1>
                    <p className="text-muted-foreground">{userData.about_me}</p>
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

                  {/* Edit Button Section */}
                  <div className="w-full sm:w-auto">
                    <Link href="/profile/edit">
                      <Button className="w-full sm:w-auto">
                        <Edit className="h-4 w-4 mr-2" /> Edit Profil
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Ready to Synergize Toggle */}
                <div className="flex items-center justify-between p-3 mt-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">Siap untuk Kolaborasi (#ReadyToSynergize)</h4>
                    <p className="text-xs text-gray-500">
                      Tampilkan profil Anda apakah bersedia menjadi kolaborator.
                    </p>
                  </div>
                  <Switch
                    checked={userData.collaboration_status ?? false}
                    onCheckedChange={handleCollaborationStatusChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Proyek</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tentang Saya</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{userData.about_me}</p>
                  </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Minat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed">{userData.interests}</p>
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Skills & Keahlian</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSkillToEdit(null);
                        setNewSkill({ name: "", proficiency: 75 });
                        setIsSkillDialogOpen(true);
                      }}
                      className="h-8 px-2 lg:px-3"
                    >
                      <Plus className="h-4 w-4 mr-0 lg:mr-2" />
                      <span className="hidden lg:inline">Tambah Skill</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {userData.user_skills?.map((userSkill) => (
                        <div key={userSkill.id} className="relative group">
                          <Badge 
                            variant="secondary" 
                            className="p-2 cursor-pointer"
                            onClick={() => {
                              setSkillToEdit(userSkill);
                              setNewSkill({ name: userSkill.skill.name, proficiency: userSkill.proficiency });
                              setIsSkillDialogOpen(true);
                            }}
                          >
                            {userSkill.skill.name}
                            <Edit className="h-3 w-3 text-gray-500 hover:text-gray-700 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Proyek Saya ({userProjects.length})</h2>
                  <Link href="/create-project">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Buat Proyek Baru
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProjects.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-10">
                      Anda belum membuat proyek apa pun.
                    </div>
                  ) : (
                    userProjects.map((project) => (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={project.image || "/placeholder.svg?height=200&width=300&text=Project"}
                            alt={project.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <Badge
                            className={`absolute top-3 left-3 ${
                              project.status === "Completed" ? "bg-green-500" : "bg-blue-500"
                            }`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                              Role: <span className="font-medium">{project.role}</span>
                            </span>
                            <span>{project.teamSize} anggota tim</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {project.skills.map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/projects/${project.id}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full bg-transparent">
                                <Eye className="h-4 w-4 mr-2" /> Lihat Detail
                              </Button>
                            </Link>
                            <Link href={`/recruiter-dashboard?projectId=${project.id}`} className="flex-1">
                              <Button size="sm" className="w-full">
                                <Users className="h-4 w-4 mr-2" /> Lihat Pelamar
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
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
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{userData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Telepon</p>
                    <p className="text-sm text-gray-600">{userData.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Media Sosial & Tautan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
              <a
                  href={userData.website_url}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LinkIcon className="h-5 w-5" />
                  <span className="text-sm">Website</span>
                  <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                </a>
                <a
                  href={userData.github_url}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="text-sm">GitHub</span>
                  <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                </a>
                <a
                  href={userData.linkedin_url}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">LinkedIn</span>
                  <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                </a>
                <a
                  href={userData.instagram_url}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <span className="text-sm">Instagram</span>
                  <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                </a>
                <a
                  href={userData.portfolio_url}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LinkIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Portfolio</span>
                  <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                </a>
              </CardContent>
            </Card>

            {/* CV Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>CV / Resume</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-8 h-8 border-2 border-t-blue-600 border-blue-200 rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-gray-500">Mengupload CV...</p>
                  </div>
                ) : userData.cv_file ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{userData.cv_file.split('/').pop()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center justify-center bg-transparent"
                        onClick={() => setIsPdfViewerOpen(true)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Lihat
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleDeleteCv}>
                         Hapus
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <File className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">Upload CV Anda untuk meningkatkan peluang kolaborasi</p>
                    <Link href="/profile/edit">
                      <Button size="sm">
                        <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload CV
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
       {/* Skill Add/Edit Dialog */}
       <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{skillToEdit ? 'Edit Skill' : 'Tambah Skill Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Skill</label>
              <Input 
                value={newSkill.name} 
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                placeholder="contoh: React, Python, UI/UX Design"
                list="skills-list"
              />
              <datalist id="skills-list">
                {allSkills.map(skill => (
                  <option key={skill.id} value={skill.name} />
                ))}
              </datalist>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Proficiency: {newSkill.proficiency}%</label>
              <Input 
                type="range"
                min="0"
                max="100"
                step="5"
                value={newSkill.proficiency} 
                onChange={(e) => setNewSkill({...newSkill, proficiency: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between">
            {skillToEdit && (
              <Button 
                variant="destructive" 
                type="button"
                onClick={() => handleDeleteSkill(skillToEdit.skill.name)}
              >
                Hapus
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSkillDialogOpen(false)}
              >
                Batal
              </Button>
              <Button 
                type="button"
                onClick={handleAddOrUpdateSkill}
              >
                {skillToEdit ? 'Simpan Perubahan' : 'Tambah Skill'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={isPdfViewerOpen} onOpenChange={setIsPdfViewerOpen}>
        <DialogContent className="max-w-5xl">
          <div className="p-4">
            <DialogTitle className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span>CV Preview: {userData.cv_file?.split('/').pop()}</span>
              <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setIsPdfViewerOpen(false)}>
                Close
              </Button>
            </DialogTitle>
            <div className="bg-gray-100 rounded-lg p-2 border border-gray-200">
              <div className="w-full h-[70vh] overflow-hidden">
                <iframe src={userData.cv_file + "#toolbar=1"} className="w-full h-full border-0" title="CV Preview" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button size="sm" onClick={() => setIsPdfViewerOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
