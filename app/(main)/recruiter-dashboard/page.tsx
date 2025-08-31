"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
// Import ArrowLeft ditambahkan
import { CheckCircle, XCircle, Zap, MapPin, ArrowLeft } from "lucide-react"
import { AnimatedModal } from "@/components/ui/animated-modal"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

// Mock data for collaborators (copied from app/collaborators/page.tsx for self-containment)
const collaboratorsData = [
  {
    id: 1,
    name: "Budi Santoso",
    avatar: "/placeholder.svg?height=80&width=80&text=BS",
    title: "Frontend Developer",
    location: "Jakarta, Indonesia",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    isReadyForCollaboration: true,
    bio: "Passionate about building beautiful and performant user interfaces. Always looking for exciting new projects.",
    email: "budi.s@example.com",
    phone: "+62 812 3456 7890",
    experience: "5 years in web development, specializing in scalable single-page applications.",
    portfolio: "https://budi.dev",
  },
  {
    id: 2,
    name: "Citra Dewi",
    avatar: "/placeholder.svg?height=80&width=80&text=CD",
    title: "UI/UX Designer",
    location: "Surabaya, Indonesia",
    skills: ["Figma", "Sketch", "User Research", "Prototyping"],
    isReadyForCollaboration: true,
    bio: "Creating intuitive and delightful user experiences is my passion. Let's build something amazing together!",
    email: "citra.d@example.com",
    phone: "+62 813 4567 8901",
    experience: "4 years in UI/UX design, with a strong focus on user-centered design principles.",
    portfolio: "https://citra.design",
  },
  {
    id: 3,
    name: "Dian Permata",
    avatar: "/placeholder.svg?height=80&width=80&text=DP",
    title: "Backend Engineer",
    location: "Bandung, Indonesia",
    skills: ["Node.js", "Python", "MongoDB", "AWS"],
    isReadyForCollaboration: true,
    bio: "Experienced in scalable backend systems and API development. Open to collaborating on challenging projects.",
    email: "dian.p@example.com",
    phone: "+62 814 5678 9012",
    experience: "6 years building robust and efficient backend services for various industries.",
    portfolio: "https://dian.tech",
  },
]

// Mock data for projects (updated with recruiterId)
const projectsData = [
  {
    id: "1",
    title: "AI-Powered Content Generator",
    description: "Develop a web application that uses AI to generate engaging content for various platforms.",
    skills: ["Python", "TensorFlow", "React", "Next.js", "NLP"],
    teamSize: 5,
    duration: "3 months",
    location: "Remote",
    status: "Open",
    recruiterId: 1, // Assuming user with id 1 (Adit Cukur) is the recruiter
  },
  {
    id: "2",
    title: "E-commerce Platform Redesign",
    description: "Revamp an existing e-commerce website with a modern UI/UX and improved performance.",
    skills: ["React", "Node.js", "MongoDB", "UI/UX", "Figma"],
    teamSize: 4,
    duration: "2 months",
    location: "Hybrid (Jakarta)",
    status: "Open",
    recruiterId: 1, // Assuming user with id 1 (Adit Cukur) is the recruiter
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
  },
]

// Mock application data
const initialApplications = [
  {
    id: "app1",
    applicantId: 1, // Budi Santoso
    projectId: "1", // AI-Powered Content Generator
    status: "Pending",
    message: "Saya sangat tertarik dengan proyek ini dan memiliki pengalaman kuat di React dan NLP.",
    appliedAt: "2024-07-20",
  },
  {
    id: "app2",
    applicantId: 2, // Citra Dewi
    projectId: "2", // E-commerce Platform Redesign
    status: "Pending",
    message: "Sebagai desainer UI/UX, saya yakin dapat memberikan kontribusi besar pada proyek redesign ini.",
    appliedAt: "2024-07-22",
  },
  {
    id: "app3",
    applicantId: 3, // Dian Permata
    projectId: "1", // AI-Powered Content Generator
    status: "Pending",
    message: "Saya seorang Backend Engineer dengan keahlian Python dan AWS, cocok untuk proyek AI ini.",
    appliedAt: "2024-07-25",
  },
]

export default function RecruiterDashboardPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  const { addToast } = useToast()

  const [applications, setApplications] = useState(initialApplications)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCollaborator, setSelectedCollaborator] = useState<(typeof collaboratorsData)[0] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentProject, setCurrentProject] = useState<any>(null)

  // Fetch project data and applications from API
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view applications");
          return;
        }

        // Fetch project details first
        try {
          const projectResponse = await api.getProjectById(projectId, token);
          const projectData = projectResponse.data || projectResponse;
          setCurrentProject(projectData);
        } catch (projectError) {
          console.error('Failed to fetch project details:', projectError);
          // Continue even if project fetch fails
        }

        // Fetch applications for the project
        const response = await api.getProjectApplications(token, projectId);
        const applicationsData = response.data || response || [];
        
        // Transform API data to match component expectations
        const transformedApplications = applicationsData.map((app: any) => ({
          id: app.id.toString(),
          applicantId: app.user.id,
          projectId: app.project_id.toString(),
          status: app.status,
          message: app.why_interested,
          appliedAt: new Date(app.applied_at).toLocaleDateString("id-ID"),
          applicant: {
            id: app.user.id,
            name: app.user.name,
            avatar: app.user.profile?.profile_picture || "/placeholder.svg",
            title: "Developer", // Default title since not in API response
            location: app.user.profile?.location || "Indonesia",
            skills: [], // Would need to fetch user skills separately
            bio: app.skills_experience,
            email: app.user.email,
            phone: app.user.profile?.phone || "",
            experience: app.contribution,
            portfolio: app.user.profile?.portfolio || "",
            isReadyForCollaboration: true,
          },
          roleData: {
            name: app.project_role?.name || "General",
            description: app.project_role?.description || "",
          }
        }));

        setApplications(transformedApplications);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load applications. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const getApplicant = (id: number) => {
    const application = applications.find((app) => app.applicantId === id);
    return application?.applicant || collaboratorsData.find((c) => c.id === id);
  }
  const getProject = (id: string) => projectsData.find((p) => p.id === id)

  const filteredApplications = projectId ? applications.filter((app) => app.projectId === projectId) : applications

  // Use real project data or fallback to mock data
  const currentProjectTitle = currentProject 
    ? currentProject.title 
    : projectId 
      ? getProject(projectId)?.title || "Proyek Tidak Ditemukan"
      : "Semua Proyek"

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        addToast({
          title: "Error",
          description: "Please login to review applications",
          type: "error",
        });
        return;
      }

      const action = newStatus === "Accepted" ? "accept" : "reject";
      await api.reviewApplication(token, appId, action);

      // Update local state
      setApplications((prev) => 
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );

      addToast({
        title: "Application Updated",
        description: `Application has been ${action}ed successfully`,
        type: "success",
      });

      console.log(`Application ${appId} status changed to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update application status:', error);
      addToast({
        title: "Failed to Update Application",
        description: error.message || "Please try again later",
        type: "error",
      });
    }
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* <Separator orientation="vertical" className="h-6" /> */}

            {/* === Tombol Kembali Ditambahkan Di Sini === */}
            <Link href="/profile" passHref>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600">
                  <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            {/* ======================================= */}
            
            <h1 className="text-xl font-semibold text-gray-800">Aplikasi Proyek: {currentProjectTitle}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">Daftar Pelamar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              Loading applications...
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-red-500 py-10">
              {error}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              Tidak ada aplikasi yang masuk untuk proyek ini.
            </div>
          ) : (
            filteredApplications.map((app) => {
              const applicant = getApplicant(app.applicantId)
              const project = getProject(app.projectId)

              if (!applicant || !project) return null // Should not happen with valid mock data

              return (
                <Card key={app.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                        <AvatarFallback>
                          {applicant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{applicant.name}</CardTitle>
                        <CardDescription className="text-sm">{applicant.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <p className="text-sm text-gray-700">
                      Melamar untuk proyek:{" "}
                      <Link href={`/projects/${project.id}`} className="font-semibold text-blue-600 hover:underline">
                        {project.title}
                      </Link>
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{applicant.location}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 mt-2">Pesan: &quot;{app.message}&quot;</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {applicant.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <Badge
                        variant={
                          app.status === "Accepted" ? "default" : app.status === "Rejected" ? "destructive" : "outline"
                        }
                      >
                        Status: {app.status}
                      </Badge>
                      <span className="text-xs text-gray-500">Dilamar pada: {app.appliedAt}</span>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setSelectedCollaborator(applicant)
                        setIsDetailModalOpen(true)
                      }}
                    >
                      Detail Pelamar
                    </Button>
                    {app.status === "Pending" && (
                      <>
                        <Button
                          variant="default"
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          onClick={() => handleStatusChange(app.id, "Accepted")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Terima
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleStatusChange(app.id, "Rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-2" /> Tolak
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Collaborator Detail Modal (reused from collaborators page) */}
      {selectedCollaborator && (
        <AnimatedModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          showCloseButton={true}
          className="max-w-md"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{selectedCollaborator.name}</h2>
            <p className="text-md text-gray-600 mb-4">{selectedCollaborator.title}</p>
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={selectedCollaborator.avatar || "/placeholder.svg"} alt={selectedCollaborator.name} />
                <AvatarFallback className="text-3xl">
                  {selectedCollaborator.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {selectedCollaborator.location}
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800">Bio:</h4>
                <p className="text-sm text-gray-700">{selectedCollaborator.bio}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Skills:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCollaborator.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Experience:</h4>
                <p className="text-sm text-gray-700">{selectedCollaborator.experience}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Contact:</h4>
                <p className="text-sm text-gray-700">Email: {selectedCollaborator.email}</p>
                <p className="text-sm text-gray-700">Phone: {selectedCollaborator.phone}</p>
                {selectedCollaborator.portfolio && (
                  <p className="text-sm text-gray-700">
                    Portfolio:{" "}
                    <a
                      href={selectedCollaborator.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedCollaborator.portfolio}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </AnimatedModal>
      )}
    </div>
  )
}