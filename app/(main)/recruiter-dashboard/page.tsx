"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Zap, MapPin, ArrowLeft } from "lucide-react"
import { AnimatedModal } from "@/components/ui/animated-modal"
import { useToast } from "@/components/ui/toast"
import { getProjectById } from "@/lib/api/project-management"
import { getProjectApplications } from "@/lib/api/project-application"
import { reviewApplication } from "@/lib/api/project-application"

export default function RecruiterDashboardPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  const { addToast } = useToast()

  const [applications, setApplications] = useState<any[]>([])
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCollaborator, setSelectedCollaborator] = useState<any>(null)
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
          const projectResponse = await getProjectById(projectId, token);
          const projectData = projectResponse.data || projectResponse;
          setCurrentProject(projectData);
        } catch (projectError) {
          console.error('Failed to fetch project details:', projectError);
          // Continue even if project fetch fails
        }

        // Fetch applications for the project
        const response = await getProjectApplications(token, projectId);
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
            title: app.user.profile?.title || "Developer", // Get title from profile if available
            location: app.user.profile?.location || "Indonesia",
            skills: app.user.profile?.skills || [], // Get skills from profile if available
            bio: app.user.profile?.bio || app.skills_experience, // Use profile bio or skills_experience as fallback
            email: app.user.email,
            phone: app.user.profile?.phone || "",
            experience: app.contribution,
            portfolio: app.user.profile?.portfolio || "",
            isReadyForCollaboration: true,
          },
          roleData: {
            name: app.project_role?.name || "General",
            description: app.project_role?.description || "",
          },
          // Add project data from API response - remove "Unknown Project" fallback
          project: {
            id: app.project?.id?.toString() || app.project_id.toString(),
            title: app.project?.title || currentProject?.title,
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
    const application = applications.find((app: any) => app.applicantId === id);
    // Return applicant data from API
    return (application as any)?.applicant;
  }

  const filteredApplications = projectId ? applications.filter((app: any) => app.projectId === projectId) : applications

  // Use real project data
  const currentProjectTitle = currentProject 
    ? currentProject.title 
    : projectId 
      ? "Loading..."
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

      // Convert status to API expected format
      const action = newStatus === "accepted" ? "accept" : "reject";
      await reviewApplication(token, appId, action);

      // Update local state with proper status formatting
      const displayStatus = newStatus === "accepted" ? "Accepted" : "Rejected";
      setApplications((prev: any[]) => 
        prev.map((app: any) => (app.id === appId ? { ...app, status: displayStatus } : app))
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
        description: "Gagal memperbarui status aplikasi. Silakan coba lagi.",
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
            filteredApplications.map((app: any) => {
              const applicant = getApplicant(app.applicantId)
              // Use the project data from the transformed application
              const project = (app as any).project

              if (!applicant || !project) return null

              return (
                <Card key={app.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                        <AvatarFallback>
                          {applicant.name
                            .split(" ")
                            .map((n: string) => n[0])
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
                      {applicant.skills?.map((skill: string) => (
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
                        // Navigate to collaborator profile page instead of showing modal
                        window.location.href = `/collaborators/${applicant.id}?from=recruiter&projectId=${projectId}`;
                      }}
                    >
                      Detail Pelamar
                    </Button>
                    {/* Fix status check - backend uses "pending" (lowercase) not "Pending" */}
                    {(app.status === "pending" || app.status === "Pending") && (
                      <>
                        <Button
                          variant="default"
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleStatusChange(app.id, "accepted")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Terima
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleStatusChange(app.id, "rejected")}
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
                    .map((n: string) => n[0])
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
                  {selectedCollaborator.skills?.map((skill: string) => (
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