"use client";

import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  LinkIcon,
  Edit,
  Users,
  Plus,
  Eye,
  Download,
  FileText,
  Upload,
  File,
  Camera,
  Github,
  Linkedin,
  Instagram,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Skill, UserSkill, Project } from "@/types";
import Image from "next/image";
import {getProfile, deleteCv} from "@/lib/api/profile-management"
import { getAllSkills, getUserSkills, updateUserSkills, deleteUserSkill} from "@/lib/api/skill-management";
import { updateCollaborationStatus } from "@/lib/api/collaboration";
import { getCreatedProjects, deleteProject } from "@/lib/api/project-management";
import { ProfileCompletionBanner } from "@/components/profile-completion-banner";

export default function ProfilePage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  // Initialize activeTab from localStorage or default to "overview"
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profileActiveTab') || "overview";
    }
    return "overview";
  });
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<UserSkill | null>(null);
  const [newSkill, setNewSkill] = useState({ name: "" });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      Promise.all([
        // 1
        getProfile(token).catch((err) => {
          console.error("Failed to fetch profile:", err);
          setApiError("Gagal memuat profil. Server mungkin tidak tersedia.");
          return null;
        }),
        getAllSkills(token).catch((err) => {
          console.error("Failed to fetch skills:", err);
          return { data: { skills: [] } };
        }),
        getUserSkills(token).catch((err) => {
          console.error("Failed to fetch user skills:", err);
          return { data: { skills: [] } };
        }),
        getCreatedProjects(token).catch((err) => {
          console.error("Failed to fetch created projects:", err);
          return { data: { projects: [] } };
        }),
      ]).then(([profileData, skillsData, userSkillsData, projectsResponse]) => {
        console.log("Full API response:", profileData);
        console.log(
          "Profile data keys:",
          profileData?.data ? Object.keys(profileData.data) : "No data"
        );

        if (profileData) {
          // The profile API returns profile details nested under 'profile' object
          // and skills directly under 'skills' array
          const profileInfo = profileData.data.profile || {};
          const directSkills = profileData.data.skills || [];

          // Convert colaboration_status string to boolean for the toggle
          // Note: API returns "colaboration_status" (typo in backend - missing one 'l')
          const collaborationStatus =
            profileData.data.colaboration_status === "ready";

          console.log(
            "API colaboration_status:",
            profileData.data.colaboration_status
          );
          console.log("Converted to boolean:", collaborationStatus);

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
            // Set collaboration_status based on the API response
            collaboration_status: collaborationStatus,
            // Use skills from profile API if available, otherwise use getUserSkills data
            user_skills:
              directSkills.length > 0
                ? directSkills
                : userSkillsData?.data?.skills || [],
          };
          setUserData(updatedProfileData);
        }
        setAllSkills(skillsData?.data?.skills || []);
        // Set user projects from API response
        console.log("Projects API response:", projectsResponse);
        setUserProjects(projectsResponse?.data || []);
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
        // Convert boolean to the specific string values expected by the API
        // Backend expects "ready" and "not ready" (with space, not underscore)
        const statusString = status ? "ready" : "not ready";
        await updateCollaborationStatus(token, statusString);
        setUserData({ ...userData, collaboration_status: status });
        setApiError(null);
      } catch (error) {
        console.error(error);
        setApiError("Gagal mengubah status kolaborasi. Coba lagi nanti.");
      }
    }
  };

  const handleDeleteCv = async () => {
    const token = localStorage.getItem("token");
    if (token && userData) {
      try {
        // 2
        await deleteCv(token);
        setUserData({ ...userData, cv_file: "" });
        setApiError(null);
      } catch (error) {
        console.error(error);
        setApiError("Gagal menghapus CV. Coba lagi nanti.");
      }
    }
  };

  const handleAddOrUpdateSkill = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userData) return;

    const skillExists = allSkills.find(
      (skill) => skill.name.toLowerCase() === newSkill.name.toLowerCase()
    );

    // Initialize with empty array if user_skills is undefined
    let skillsToUpdate = [
      ...(userData.user_skills || []).map((us) => ({
        skill_name: us.skill.name,
      })),
    ];

    if (skillToEdit) {
      // Editing existing skill
      skillsToUpdate = skillsToUpdate.map((s) =>
        s.skill_name === skillToEdit.skill.name
          ? { skill_name: newSkill.name }
          : s
      );
    } else {
      // Adding new skill
      skillsToUpdate.push({ skill_name: newSkill.name });
    }

    console.log("Skills to update:", skillsToUpdate);

    try {
      await updateUserSkills(token, skillsToUpdate);

      // Refresh both profile and user skills
      const [updatedProfile, updatedUserSkills] = await Promise.all([
        // 3
        getProfile(token),
        getUserSkills(token),
      ]);

      // Handle the nested profile structure
      const profileInfo = updatedProfile.data.profile || {};
      const directSkills = updatedProfile.data.skills || [];

      // Convert colaboration_status string to boolean for the toggle
      const collaborationStatus =
        updatedProfile.data.colaboration_status === "ready";

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
        collaboration_status: collaborationStatus,
        user_skills:
          directSkills.length > 0
            ? directSkills
            : updatedUserSkills?.data?.skills || [],
      };
      setUserData(updatedProfileData);

      setIsSkillDialogOpen(false);
      setNewSkill({ name: "" });
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
      await deleteUserSkill(token, skillName);

      // Refresh both profile and user skills
      const [updatedProfile, updatedUserSkills] = await Promise.all([
        // 4
        getProfile(token),
        getUserSkills(token),
      ]);

      // Handle the nested profile structure
      const profileInfo = updatedProfile.data.profile || {};
      const directSkills = updatedProfile.data.skills || [];

      // Convert colaboration_status string to boolean for the toggle
      const collaborationStatus =
        updatedProfile.data.colaboration_status === "ready";

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
        collaboration_status: collaborationStatus,
        user_skills:
          directSkills.length > 0
            ? directSkills
            : updatedUserSkills?.data?.skills || [],
      };
      setUserData(updatedProfileData);

      setIsSkillDialogOpen(false);
      setApiError(null);
    } catch (error) {
      console.error(error);
      setApiError("Gagal menghapus skill. Coba lagi nanti.");
    }
  };

  // Handle delete project functionality
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setIsDeleting(true);
    try {
      await deleteProject(token, projectToDelete.id.toString());

      // Remove the project from the local state
      setUserProjects((prev) =>
        prev.filter((p) => p.id !== projectToDelete.id)
      );

      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
      setApiError(null);
    } catch (error) {
      console.error(error);
      setApiError("Gagal menghapus proyek. Coba lagi nanti.");
    } finally {
      setIsDeleting(false);
    }
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
            Tidak Dapat Memuat Profil
          </h2>
          <p className="text-gray-600 mb-4">{apiError}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
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
        {/* Profile Completion Banner */}
        <ProfileCompletionBanner userData={userData} />
        
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
                        className="object-cover w-full h-full"
                      />
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

                  {/* Edit Button Section */}
                  <div className="w-full sm:w-auto">
                    <Link href="/profile/edit">
                      <Button className="w-full sm:w-auto">
                        <Edit className="h-4 w-4 mr-2" /> Edit Profile
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Ready to Synergize Toggle */}
                <div className="flex items-center justify-between p-3 mt-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">
                      Siap untuk Kolaborasi (#ReadyToSynergize)
                    </h4>
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
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);
                localStorage.setItem('profileActiveTab', value);
              }}
              className="w-full"
            >
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
                    <p className="text-gray-700 leading-relaxed">
                      {userData.about_me}
                    </p>
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
                        setNewSkill({ name: "" });
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
                              setNewSkill({ name: userSkill.skill.name });
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold">
                    Proyek Saya ({userProjects.length})
                  </h2>
                  <Link href="/create-project">
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" /> Buat Proyek Baru
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
                          <Image
                            src={
                              project.picture_url ||
                              "/placeholder.svg?height=200&width=300&text=Project"
                            }
                            alt={project.title}
                            width={300}
                            height={200}
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
                              Role:{" "}
                              <span className="font-medium">
                                Project Creator
                              </span>
                            </span>
                            <span className="text-nowrap">
                              {project.filled_team + 1}/{project.total_team}{" "}
                              anggota
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

                          <div className="flex flex-col gap-2 mt-auto">
                            {/* First row: View and Edit buttons */}
                            <div className="grid grid-cols-2 gap-2">
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
                                  <span className="hidden xs:inline">Lihat</span>
                                  <span className="xs:hidden">Detail</span>
                                </Button>
                              </Link>
                              <Link
                                href={`/edit-project/${project.id}`}
                                className="flex-1"
                              >
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="w-full text-xs sm:text-sm h-8 sm:h-9"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
                                  Edit
                                </Button>
                              </Link>
                            </div>
                            
                            {/* Second row: Applicants and Delete buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                href={`/recruiter-dashboard?projectId=${project.id}`}
                                className="flex-1"
                              >
                                <Button size="sm" className="w-full text-xs sm:text-sm h-8 sm:h-9">
                                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
                                  <span className="hidden xs:inline">Lihat</span>
                                  <span className="xs:hidden">Pelamar</span>
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm h-8 sm:h-9"
                                onClick={() => handleDeleteProject(project)}
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden xs:inline">Hapus</span>
                              </Button>
                            </div>
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
                {userData.website_url && (
                  <a
                    href={userData.website_url}
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
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LinkIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Portfolio</span>
                    <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                  </a>
                )}
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
                {userData.cv_file ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {/* wwww */}
                          {userData.name}_CV.pdf
                        </p>
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
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteCv}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <File className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      Upload CV Anda untuk meningkatkan peluang kolaborasi
                    </p>
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
            <DialogTitle>
              {skillToEdit ? "Edit Skill" : "Tambah Skill Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Skill</label>
              <Input
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, name: e.target.value })
                }
                placeholder="contoh: React, Python, UI/UX Design"
                list="skills-list"
              />
              <datalist id="skills-list">
                {allSkills.map((skill) => (
                  <option key={skill.id} value={skill.name} />
                ))}
              </datalist>
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
                disabled={!newSkill.name.trim()}
              >
                {skillToEdit ? "Simpan Perubahan" : "Tambah Skill"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={isPdfViewerOpen} onOpenChange={setIsPdfViewerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] items-center justify-center" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate pr-4" title={`CV Preview: ${userData.name}_CV.pdf`}>
                CV Preview: {userData.name}_CV.pdf
              </span>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (userData.cv_file) {
                      window.open(userData.cv_file, "_blank");
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPdfViewerOpen(false)}
                >
                  Close
                </Button>
              </div>
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
                    // Fallback: open in new tab if iframe fails
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

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Konfirmasi Hapus Proyek
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Peringatan:</strong> Tindakan ini tidak dapat
                dibatalkan!
              </p>
            </div>
            {projectToDelete && (
              <div>
                <p className="text-sm text-gray-700">
                  Anda akan menghapus proyek:
                </p>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                  <p className="font-medium text-gray-900">
                    {projectToDelete.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {projectToDelete.description}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-3">
                  Semua data proyek, termasuk aplikan dan informasi terkait akan
                  dihapus secara permanen.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteProject}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin"></div>
                  <span>Menghapus...</span>
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Ya, Hapus Proyek
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
