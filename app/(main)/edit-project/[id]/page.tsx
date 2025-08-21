"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/toast"
import {
  Plus,
  X,
  Upload,
  Calendar,
  Users,
  Briefcase,
  Target,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Zap,
  Home,
  Minus,
  Edit,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { api } from "@/lib/api"
import { TimelineStatusOption, Project } from "@/types"

// Timeline status options - hardcoded based on backend constants
const TIMELINE_STATUS_OPTIONS: TimelineStatusOption[] = [
  {
    value: "not-started",
    label: "Belum Dimulai",
    description: "Tahapan ini belum dimulai",
    color: "#6B7280" // Gray
  },
  {
    value: "in-progress", 
    label: "Sedang Berjalan",
    description: "Tahapan ini sedang dikerjakan",
    color: "#F59E0B" // Yellow/Orange
  },
  {
    value: "done",
    label: "Selesai", 
    description: "Tahapan ini telah diselesaikan",
    color: "#10B981" // Green
  }
]

const projectTypes = [
  { value: "Lomba", label: "Lomba", description: "Kompetisi atau hackathon" },
  { value: "Riset", label: "Riset Dosen", description: "Penelitian dengan dosen pembimbing" },
  { value: "Portofolio", label: "Portofolio Latihan", description: "Proyek untuk berlatih berkolaborasi" },
  { value: "Kuliah", label: "Tugas Kuliah", description: "Proyek mata kuliah" },
  { value: "Open-source", label: "Open Source", description: "Proyek open source" },
  { value: "Social", label: "Social Impact", description: "Proyek dampak sosial" },
  { value: "Lainnya", label: "Lainnya", description: "Proyek Lain" },
]

const skillOptions = [
  "Frontend Development",
  "Backend Development",
  "Mobile Development",
  "UI/UX Design",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Project Management",
  "Digital Marketing",
  "Content Writing",
  "Video Editing",
  "Graphic Design",
  "Business Analysis",
  "Quality Assurance",
  "Cybersecurity",
]

const locationOptions = [
  "Remote",
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Medan",
  "Makassar",
  "Semarang",
  "Palembang",
  "Denpasar",
]

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [projectData, setProjectData] = useState<Project | null>(null)
  const [originalFormData, setOriginalFormData] = useState<any>(null) // Store original data for cancel functionality
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: "",
    type: "",
    description: "",
    image: null as File | null,

    // Step 2: Details
    duration: "",
    startDate: "",
    endDate: "",
    location: "",
    workType: "",
    teamSize: 2,
    budget: "",
    deadline: "",
    existingMembers: [
      {
        name: "",
        role: "",
        description: "",
        skills: [] as string[],
      },
    ],

    // Step 3: Requirements
    requiredSkills: [] as string[],
    experience: "",
    commitment: "",
    requirements: [] as string[],

    // Step 4: Team & Roles
    roles: [
      {
        title: "",
        description: "",
        skills: [] as string[],
        count: 1,
      },
    ],

    // Step 5: Additional Info
    benefits: [] as string[],
    timelineSteps: [] as { 
      title: string;
      status: "not-started" | "in-progress" | "done";
    }[],
    tags: [] as string[],
  })

  // Load project data when component mounts
  useEffect(() => {
    const loadProject = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          addToast({
            title: "Error",
            description: "Please login to edit a project",
            type: "error",
          })
          router.push("/login")
          return
        }

        // Fetch project data using the existing API endpoint
        const response = await fetch(`https://synergazing.bahasakita.store/api/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch project data')
        }

        const data = await response.json()
        const project = data.data

        setProjectData(project)
        
        // Format dates to YYYY-MM-DD for HTML input
        const formatDate = (dateString: string) => {
          if (!dateString) return ""
          const date = new Date(dateString)
          return date.toISOString().split('T')[0]
        }

        // Populate form data
        const initialFormData = {
          // Step 1: Basic Info (read-only for editing)
          title: project.title || "",
          type: project.project_type || "",
          description: project.description || "",
          image: null, // Can't pre-populate file input

          // Step 2: Details
          duration: project.duration || "",
          startDate: formatDate(project.start_date),
          endDate: formatDate(project.end_date),
          location: project.location || "",
          workType: "",
          teamSize: project.total_team || 2,
          budget: project.budget || "",
          deadline: formatDate(project.registration_deadline),
          existingMembers: project.members?.map((member: any) => ({
            name: member.name || "",
            role: member.role_name || "",
            description: member.role_description || "",
            skills: member.skill_names || [],
          })) || [],

          // Step 3: Requirements
          requiredSkills: project.required_skills?.map((skill: any) => skill.skill.name) || [],
          experience: "",
          commitment: project.time_commitment || "",
          requirements: project.conditions?.map((condition: any) => condition.description) || [],

          // Step 4: Team & Roles
          roles: project.roles?.map((role: any) => ({
            title: role.name || "",
            description: role.description || "",
            skills: role.required_skills?.map((skill: any) => skill.skill.name) || [],
            count: role.slots_available || 1,
          })) || [{
            title: "",
            description: "",
            skills: [],
            count: 1,
          }],

          // Step 5: Additional Info
          benefits: project.benefits?.map((benefit: any) => benefit.benefit.name) || [],
          timelineSteps: project.timeline?.map((timeline: any) => ({
            title: timeline.timeline.name || "",
            status: timeline.timeline_status as "not-started" | "in-progress" | "done" || "not-started",
          })) || [],
          tags: project.tags?.map((tag: any) => tag.tag.name) || [],
        }

        setFormData(initialFormData)
        // Store original data for cancel functionality
        setOriginalFormData(JSON.parse(JSON.stringify(initialFormData)))

        // Only set initial step if we haven't loaded project data before
        // This prevents resetting the step when user is navigating through steps
        if (!projectData) {
          console.log("Setting initial step to 2 (first time loading)")
          setCurrentStep(2)
        }

      } catch (error) {
        console.error("Error loading project:", error)
        addToast({
          title: "Error",
          description: "Failed to load project data",
          type: "error",
        })
        router.push("/profile")
      } finally {
        setIsLoadingProject(false)
      }
    }

    // Only load project data if we don't have it yet and projectId exists
    if (projectId && !projectData && isLoadingProject) {
      console.log("Loading project data for ID:", projectId)
      loadProject()
    }
  }, [projectId, router, addToast, projectData, isLoadingProject])

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Judul proyek wajib diisi"
      if (!formData.type) newErrors.type = "Tipe proyek wajib dipilih"
      if (!formData.description.trim()) newErrors.description = "Deskripsi proyek wajib diisi"
      if (formData.description.length < 50) newErrors.description = "Deskripsi minimal 50 karakter"
    }

    if (step === 2) {
      if (!formData.duration) newErrors.duration = "Durasi proyek wajib diisi"
      if (!formData.startDate) newErrors.startDate = "Tanggal mulai wajib diisi"
      if (!formData.location) newErrors.location = "Lokasi wajib dipilih"
      if (!formData.deadline) newErrors.deadline = "Deadline wajib diisi"
      if (formData.teamSize < 2) newErrors.teamSize = "Ukuran tim minimal 2 orang"
    }

    if (step === 3) {
      if (formData.requiredSkills.length === 0) newErrors.requiredSkills = "Minimal tambahkan 1 skill atau tag untuk proyek ini"
      if (!formData.commitment) newErrors.commitment = "Komitmen waktu wajib diisi"
    }

    if (step === 4) {
      const hasValidRole = formData.roles.some((role) => role.title.trim() && role.description.trim())
      if (!hasValidRole) newErrors.roles = "Minimal tambahkan 1 role yang dibutuhkan"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    console.log("handleNext called, currentStep:", currentStep)
    
    // Prevent multiple calls while loading
    if (isLoading) {
      console.log("Already loading, ignoring click")
      return
    }
    
    if (!validateStep(currentStep)) {
      console.log("Validation failed for step:", currentStep, "Errors:", errors)
      return
    }

    // Just advance to next step without saving (draft mode)
    const nextStep = currentStep + 1
    console.log("Advancing from step", currentStep, "to step", nextStep)
    
    setCurrentStep(nextStep)
    
    addToast({
      title: "Draft Saved Locally",
      description: `Moving to ${nextStep === 3 ? 'Requirements' : nextStep === 4 ? 'Team & Roles' : 'Finalization'} section...`,
      type: "success",
    })
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        addToast({
          title: "Error",
          description: "Please login to edit a project",
          type: "error",
        })
        setIsLoading(false)
        return
      }

      // Save all changes at once when user clicks final submit
      
      // Stage 2: Update Project Details
      const formatDateToRFC3339 = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString();
      };

      const stage2Data = {
        duration: formData.duration,
        total_team: formData.teamSize,
        start_date: formatDateToRFC3339(formData.startDate),
        end_date: formData.endDate ? formatDateToRFC3339(formData.endDate) : undefined,
        location: formData.location,
        budget: formData.budget || undefined,
        registration_deadline: formatDateToRFC3339(formData.deadline),
      }

      await api.updateProjectStage2(token, projectId, stage2Data)

      // Stage 3: Update Project Requirements
      const stage3Data = {
        time_commitment: formData.commitment,
        required_skills: formData.requiredSkills.map(skill => ({ name: skill })),
        conditions: formData.requirements.filter(req => req.trim()).map(req => ({ description: req })),
      }

      await api.updateProjectStage3(token, projectId, stage3Data)

      // Stage 4: Update Team & Roles
      const stage4Data = {
        roles: formData.roles.filter(role => role.title.trim()).map(role => ({
          name: role.title,
          slots_available: role.count,
          description: role.description,
          skill_names: role.skills,
        })),
        members: formData.existingMembers
          .filter(member => 
            member.name.trim() && 
            member.role.trim() && 
            member.name.trim() !== "" &&
            member.name.trim().length > 2
          )
          .map(member => ({
            name: member.name,
            role_name: member.role,
            role_description: member.description,
            skill_names: member.skills,
          })),
      }

      await api.updateProjectStage4(token, projectId, stage4Data)

      // Stage 5: Update Final Project Details
      const stage5Data = {
        benefits: formData.benefits.filter(benefit => benefit.trim()).map(benefit => ({ description: benefit })),
        timeline: formData.timelineSteps.filter(step => step.title.trim()).map(step => ({
          name: step.title,
          status: step.status,
        })),
        tags: formData.tags.map(tag => ({ name: tag })),
      }

      await api.updateProjectStage5(token, projectId, stage5Data)

      addToast({
        title: "Proyek Berhasil Diperbarui!",
        description: "Semua perubahan telah disimpan ke database.",
        type: "success",
        duration: 5000
      })
      
      // Redirect to profile page after success
      setTimeout(() => {
        router.push("/profile?tab=projects")
      }, 1500)
      
    } catch (error) {
      console.error("Error in final update:", error)
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update project",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cancel - revert all changes to original state
  const handleCancel = () => {
    if (originalFormData) {
      setFormData(JSON.parse(JSON.stringify(originalFormData)))
      addToast({
        title: "Changes Discarded",
        description: "All changes have been reverted to original state.",
        type: "success",
      })
    }
    router.push("/profile?tab=projects")
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // All the utility functions from create project (addSkill, removeSkill, etc.)
  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.requiredSkills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill.trim()]
      }));
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }));
  }

  // ... (all other utility functions from create project - addRole, removeRole, etc.)
  
  const addRole = () => {
    setFormData((prev) => ({
      ...prev,
      roles: [...prev.roles, { title: "", description: "", skills: [], count: 1 }],
    }))
  }

  const removeRole = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index),
    }))
  }

  const updateRole = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.map((role, i) => (i === index ? { ...role, [field]: value } : role)),
    }))
  }

  const addExistingMember = () => {
    setFormData((prev) => ({
      ...prev,
      existingMembers: [...prev.existingMembers, { name: "", role: "", description: "", skills: [] }],
    }))
  }

  const removeExistingMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingMembers: prev.existingMembers.filter((_, i) => i !== index),
    }))
  }

  const updateExistingMember = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      existingMembers: prev.existingMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      ),
    }))
  }

  const addTimelineStep = () => {
    setFormData((prev) => ({
      ...prev,
      timelineSteps: [
        ...prev.timelineSteps,
        { title: "", status: "not-started" as const }
      ],
    }))
  }

  const removeTimelineStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      timelineSteps: prev.timelineSteps.filter((_, i) => i !== index),
    }))
  }

  const updateTimelineStep = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      timelineSteps: prev.timelineSteps.map((step, i) => (
        i === index ? { ...step, [field]: value } : step
      )),
    }))
  }

  const handleImageUpload = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        title: "Error",
        description: "Please upload a valid image file (JPG, PNG, or WebP)",
        type: "error",
      });
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast({
        title: "Error", 
        description: "File size must be less than 2MB",
        type: "error",
      });
      return;
    }

    handleInputChange("image", file);
  };

  const handleImageRemove = () => {
    handleInputChange("image", null);
  };

  const filledSlots = 1 + formData.existingMembers.filter(member => member.name.trim() && member.role.trim()).length;
  const remainingSlots = formData.teamSize - filledSlots;
  const totalDefinedSlots = formData.roles.reduce((acc, role) => acc + role.count, 0);

  const getAssignedCountForRole = (roleTitle: string) => {
    return formData.existingMembers.filter(member => member.role === roleTitle).length;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Edit Informasi Dasar"
      case 2:
        return "Edit Detail Proyek"
      case 3:
        return "Edit Persyaratan"
      case 4:
        return "Edit Tim & Role"
      case 5:
        return "Edit Finalisasi"
      default:
        return "Edit Proyek"
    }
  }

  const incrementTeamSize = () => {
    handleInputChange("teamSize", formData.teamSize + 1)
  }

  const decrementTeamSize = () => {
    if (formData.teamSize > 2) {
      handleInputChange("teamSize", formData.teamSize - 1)
    }
  }

  if (isLoadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-blue-600 border-blue-200 rounded-full animate-spin mb-3 mx-auto"></div>
          <p className="text-sm text-gray-500">Memuat data proyek...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Progress */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-gradient-to-b from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-bold">Edit Proyek</span>
                    </div>

                    <div className="space-y-4">
                      {[
                        { step: 1, title: "Informasi Dasar", icon: Briefcase, disabled: true },
                        { step: 2, title: "Detail Proyek", icon: Calendar },
                        { step: 3, title: "Persyaratan", icon: Target },
                        { step: 4, title: "Tim & Role", icon: Users },
                        { step: 5, title: "Finalisasi", icon: CheckCircle },
                      ].map(({ step, title, icon: Icon, disabled }) => (
                        <div
                          key={step}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            disabled
                              ? "bg-gray-100 text-gray-400"
                              : step === currentStep
                                ? "bg-white shadow-sm border border-blue-200"
                                : step < currentStep
                                  ? "bg-green-50 text-green-700"
                                  : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              disabled
                                ? "bg-gray-300 text-gray-500"
                                : step === currentStep
                                  ? "bg-blue-600 text-white"
                                  : step < currentStep
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200"
                            }`}
                          >
                            {disabled ? <X className="h-4 w-4" /> : step < currentStep ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                          </div>
                          <span className="text-sm font-medium">{title}</span>
                          {disabled && <span className="text-xs text-gray-400 ml-auto">Tidak dapat diedit</span>}
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium">{Math.round(((currentStep - 1) / 4) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit className="h-5 w-5 text-blue-600" />
                      <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
                    </div>
                    <p className="text-gray-600">Langkah {currentStep} dari 5 - Edit: {projectData?.title}</p>
                    
                    {/* Notice about Stage 1 limitations */}
                    <Card className="mt-4 border-amber-200 bg-amber-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-amber-800 mb-1">Informasi Penting</h4>
                            <p className="text-sm text-amber-700">
                              Informasi dasar proyek (judul, tipe, deskripsi, dan gambar) tidak dapat diubah setelah proyek dibuat. 
                              Anda hanya dapat mengedit detail proyek, persyaratan, tim & role, serta informasi finalisasi.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Form Content - Use stable key for proper input handling */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`step-${currentStep}`} // Use stable key based only on currentStep
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      {console.log("Rendering step:", currentStep)} {/* Debug render */}
                      
                 
                      
                      {/* The form steps would go here - same as create project */}
                      {/* I'll implement the key steps for demonstration */}
                      
                      {currentStep === 1 && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Judul Proyek *</label>
                            <Input
                              placeholder="e.g. Aplikasi Smart Campus IoT"
                              value={formData.title}
                              onChange={(e) => handleInputChange("title", e.target.value)}
                              className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.title}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Tipe Proyek *</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {projectTypes.map((type) => (
                                <Card
                                  key={type.value}
                                  className={`cursor-pointer transition-all hover:shadow-md ${
                                    formData.type === type.value ? "ring-2 ring-blue-500 bg-blue-50" : ""
                                  }`}
                                  onClick={() => handleInputChange("type", type.value)}
                                >
                                  <CardContent className="p-4">
                                    <h4 className="font-medium">{type.label}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Deskripsi Proyek *</label>
                            <Textarea
                              placeholder="Jelaskan proyek Anda secara detail..."
                              value={formData.description}
                              onChange={(e) => handleInputChange("description", e.target.value)}
                              className={`min-h-[120px] resize-none ${errors.description ? "border-red-500" : ""}`}
                            />
                            <div className="flex justify-between items-center mt-1">
                              <div>
                                {errors.description && (
                                  <p className="text-red-500 text-sm flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.description}
                                  </p>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{formData.description.length}/500</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Project Details */}
                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium mb-2">Durasi Proyek *</label>
                              <Select
                                value={formData.duration}
                                onValueChange={(value) => handleInputChange("duration", value)}
                              >
                                <SelectTrigger className={errors.duration ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Pilih durasi" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1-bulan">1 Bulan</SelectItem>
                                  <SelectItem value="2-bulan">2 Bulan</SelectItem>
                                  <SelectItem value="3-bulan">3 Bulan</SelectItem>
                                  <SelectItem value="4-bulan">4 Bulan</SelectItem>
                                  <SelectItem value="5-bulan">5 Bulan</SelectItem>
                                  <SelectItem value="6-bulan">6 Bulan</SelectItem>
                                  <SelectItem value="lebih-6-bulan">Lebih dari 6 Bulan</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.duration && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {errors.duration}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Ukuran Tim *</label>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={decrementTeamSize}
                                  disabled={formData.teamSize <= 2}
                                  className={`h-10 w-10 ${formData.teamSize <= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  readOnly
                                  value={`${formData.teamSize} orang`}
                                  className={`text-center font-medium ${errors.teamSize ? "border-red-500" : ""}`}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={incrementTeamSize}
                                  className="h-10 w-10"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              {errors.teamSize && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {errors.teamSize}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium mb-2">Tanggal Mulai *</label>
                              <Input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleInputChange("startDate", e.target.value)}
                                className={errors.startDate ? "border-red-500" : ""}
                              />
                              {errors.startDate && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {errors.startDate}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Tanggal Selesai (Estimasi)</label>
                              <Input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange("endDate", e.target.value)}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Lokasi *</label>
                            <Select
                              value={formData.location}
                              onValueChange={(value) => handleInputChange("location", value)}
                            >
                              <SelectTrigger className={errors.location ? "border-red-500" : ""}>
                                <SelectValue placeholder="Pilih lokasi" />
                              </SelectTrigger>
                              <SelectContent>
                                {locationOptions.map((location) => (
                                  <SelectItem key={location} value={location}>
                                    {location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.location && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.location}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Budget Proyek (Opsional)</label>
                              <Input
                                type="text"
                                placeholder="e.g. Rp 2.000.000 atau Hadiah Lomba"
                                value={formData.budget}
                                onChange={(e) => handleInputChange("budget", e.target.value)}
                                className="bg-white"
                              />
                              <p className="text-xs text-gray-500 mt-1">Bisa berupa nominal atau bentuk hadiah lainnya</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Deadline Pendaftaran *</label>
                              <Input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => handleInputChange("deadline", e.target.value)}
                                className={`bg-white ${errors.deadline ? "border-red-500" : ""}`}
                              />
                              {errors.deadline && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {errors.deadline}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Requirements */}
                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Skills & Tags Proyek *</label>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Tambahkan skill atau tag (e.g. React, UI/UX, IoT)"
                                id="skill-input"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.currentTarget as HTMLInputElement;
                                    addSkill(input.value);
                                    input.value = '';
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const input = document.getElementById('skill-input') as HTMLInputElement;
                                  addSkill(input.value);
                                  input.value = '';
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-3">
                              {formData.requiredSkills.length > 0 ? (
                                formData.requiredSkills.map((skill, skillIndex) => (
                                  <Badge key={`${skill}-${skillIndex}`} variant="secondary" className="text-xs py-1 px-2 flex items-center gap-1">
                                    {skill}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 hover:bg-red-100"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeSkill(skill);
                                      }}
                                    >
                                      <X className="h-3 w-3 text-red-500 hover:text-red-700" />
                                    </Button>
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">Belum ada skill atau tag yang ditambahkan</p>
                              )}
                            </div>
                            
                            {errors.requiredSkills && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.requiredSkills}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium mb-2">Komitmen Waktu *</label>
                              <Select
                                value={formData.commitment}
                                onValueChange={(value) => handleInputChange("commitment", value)}
                              >
                                <SelectTrigger className={errors.commitment ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Jam per minggu" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5-10">5-10 jam/minggu</SelectItem>
                                  <SelectItem value="10-20">10-20 jam/minggu</SelectItem>
                                  <SelectItem value="20-30">20-30 jam/minggu</SelectItem>
                                  <SelectItem value="30+">30+ jam/minggu</SelectItem>
                                  <SelectItem value="flexible">Fleksibel</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.commitment && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {errors.commitment}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Persyaratan Tambahan</label>
                            <div className="space-y-2">
                              {formData.requirements.map((req, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    placeholder={`Persyaratan #${index + 1}`}
                                    value={req}
                                    onChange={(e) => {
                                      const newRequirements = [...formData.requirements];
                                      newRequirements[index] = e.target.value;
                                      handleInputChange("requirements", newRequirements);
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newRequirements = formData.requirements.filter((_, i) => i !== index);
                                      handleInputChange("requirements", newRequirements);
                                    }}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleInputChange("requirements", [...formData.requirements, ""])}
                              className="mt-2"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Tambah Persyaratan
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Team & Roles */}
                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4 text-center">
                              <p className="font-medium text-blue-800">
                                Kapasitas Tim: {formData.teamSize} orang
                              </p>
                              <p className="text-sm text-blue-700 mt-1">
                                Slot Terisi: {filledSlots} dari {formData.teamSize} (Termasuk Anda sebagai Project Lead)
                              </p>
                              {totalDefinedSlots > formData.teamSize - 1 && (
                                  <p className="text-red-600 text-xs mt-2 flex items-center justify-center gap-1">
                                      <AlertCircle className="h-4 w-4" />
                                      Total slot yang didefinisikan ({totalDefinedSlots}) melebihi sisa kapasitas tim ({formData.teamSize - 1}).
                                  </p>
                              )}
                            </CardContent>
                          </Card>

                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Role pada Project Ini</h3>
                            <Button onClick={addRole} size="sm" variant="outline">
                              <Plus className="h-4 w-4 mr-2" />
                              Tambah Role
                            </Button>
                          </div>

                          <div className="space-y-6">
                            {formData.roles.map((role, index) => (
                              <Card key={index}>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium">Role {index + 1}</h4>
                                    {formData.roles.length > 1 && (
                                      <Button onClick={() => removeRole(index)} size="sm" variant="ghost">
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="md:col-span-2">
                                      <label className="block text-sm font-medium mb-2">Nama Role</label>
                                      <Input
                                        placeholder="e.g. Frontend Developer"
                                        value={role.title}
                                        onChange={(e) => updateRole(index, "title", e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-2">Total Slot</label>
                                      <Select
                                        value={role.count.toString()}
                                        onValueChange={(value) => updateRole(index, "count", Number.parseInt(value))}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: formData.teamSize - 1 }, (_, i) => i + 1).map((num) => (
                                            <SelectItem key={num} value={num.toString()}>
                                              {num} orang
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Deskripsi Role</label>
                                    <Textarea
                                      placeholder="Jelaskan tanggung jawab dan tugas untuk role ini..."
                                      value={role.description}
                                      onChange={(e) => updateRole(index, "description", e.target.value)}
                                      className="min-h-[80px] resize-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium mb-2">Skills untuk Role Ini</label>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Input
                                        placeholder="Tambahkan skill (e.g. React, Node.js)"
                                        id={`role-skill-input-${index}`}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.currentTarget as HTMLInputElement;
                                            if (input.value.trim()) {
                                              updateRole(index, "skills", [...role.skills, input.value.trim()]);
                                              input.value = '';
                                            }
                                          }
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          const input = document.getElementById(`role-skill-input-${index}`) as HTMLInputElement;
                                          if (input.value.trim()) {
                                            updateRole(index, "skills", [...role.skills, input.value.trim()]);
                                            input.value = '';
                                          }
                                        }}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {role.skills.length > 0 ? (
                                        role.skills.map((skill, skillIndex) => (
                                          <Badge key={`${skill}-${skillIndex}`} variant="secondary" className="text-xs py-1 px-2 flex items-center gap-1">
                                            {skill}
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-4 w-4 p-0 hover:bg-red-100"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateRole(
                                                  index, 
                                                  "skills", 
                                                  role.skills.filter(s => s !== skill)
                                                );
                                              }}
                                            >
                                              <X className="h-3 w-3 text-red-500 hover:text-red-700" />
                                            </Button>
                                          </Badge>
                                        ))
                                      ) : (
                                        <p className="text-sm text-gray-500">Belum ada skill yang ditambahkan</p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {errors.roles && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.roles}
                            </p>
                          )}

                          <div className="mt-8">
                              <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-medium">Anggota Tim yang Sudah Ada</h3>
                                  <Button 
                                      onClick={addExistingMember} 
                                      size="sm" 
                                      variant="outline"
                                      disabled={remainingSlots <= 0}
                                  >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Tambah Anggota
                                  </Button>
                              </div>

                            {formData.existingMembers.length === 0 && (
                              <p className="text-center text-sm text-gray-500 py-4">
                                Belum ada anggota tim yang ditambahkan. Tambahkan anggota tim yang sudah ada jika perlu.
                              </p>
                            )}

                            {formData.existingMembers.map((member, index) => (
                              <Card key={index} className="mb-4">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium">Anggota {index + 1}</h4>
                                    <Button onClick={() => removeExistingMember(index)} size="sm" variant="ghost">
                                      <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-2">Nama</label>
                                      <Input
                                        placeholder="e.g. John Doe"
                                        value={member.name}
                                        onChange={(e) => updateExistingMember(index, "name", e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-2">Role</label>
                                      {formData.roles.filter(role => role.title.trim()).length > 0 ? (
                                        <Select
                                          value={member.role}
                                          onValueChange={(value) => updateExistingMember(index, "role", value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Pilih role dari yang sudah didefinisikan" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {formData.roles
                                              .filter(role => role.title.trim())
                                              .map((role) => (
                                                <SelectItem key={role.title} value={role.title}>
                                                  {role.title}
                                                </SelectItem>
                                              ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                          <p className="text-sm text-yellow-700">
                                            Silakan definisikan role terlebih dahulu di bagian "Role pada Project Ini" di atas
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Deskripsi Role</label>
                                    <Textarea
                                      placeholder="Jelaskan tanggung jawab dan tugas untuk anggota tim ini..."
                                      value={member.description}
                                      onChange={(e) => updateExistingMember(index, "description", e.target.value)}
                                      className="min-h-[80px] resize-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium mb-2">Skills</label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        placeholder="Tambahkan skill (e.g. React, Node.js)"
                                        id={`member-skill-input-${index}`}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.currentTarget as HTMLInputElement;
                                            if (input.value.trim()) {
                                              updateExistingMember(
                                                index, 
                                                "skills", 
                                                [...member.skills, input.value.trim()]
                                              );
                                              input.value = '';
                                            }
                                          }
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          const input = document.getElementById(`member-skill-input-${index}`) as HTMLInputElement;
                                          if (input.value.trim()) {
                                            updateExistingMember(
                                              index, 
                                              "skills", 
                                              [...member.skills, input.value.trim()]
                                            );
                                            input.value = '';
                                          }
                                        }}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {member.skills.length > 0 ? (
                                        member.skills.map((skill, skillIndex) => (
                                          <Badge key={`${skill}-${skillIndex}`} variant="secondary" className="text-xs py-1 px-2 flex items-center gap-1">
                                            {skill}
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-4 w-4 p-0 hover:bg-red-100"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateExistingMember(
                                                  index, 
                                                  "skills", 
                                                  member.skills.filter(s => s !== skill)
                                                );
                                              }}
                                            >
                                              <X className="h-3 w-3 text-red-500 hover:text-red-700" />
                                            </Button>
                                          </Badge>
                                        ))
                                      ) : (
                                        <p className="text-sm text-gray-500">Belum ada skill yang ditambahkan</p>
                                      )}
                                    </div>
                                    </div>
                                  </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 5: Finalization */}
                      {currentStep === 5 && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Benefit untuk Kolaborator</label>
                            <div className="space-y-2">
                              {formData.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    placeholder={`Benefit #${index + 1}`}
                                    value={benefit}
                                    onChange={(e) => {
                                      const newBenefits = [...formData.benefits];
                                      newBenefits[index] = e.target.value;
                                      handleInputChange("benefits", newBenefits);
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newBenefits = formData.benefits.filter((_, i) => i !== index);
                                      handleInputChange("benefits", newBenefits);
                                    }}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleInputChange("benefits", [...formData.benefits, ""])}
                              className="mt-2"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Tambah Benefit
                            </Button>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Timeline Proyek</label>
                            <div className="flex items-center justify-between mb-4">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={addTimelineStep}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Tahapan
                              </Button>
                            </div>
                            
                            {formData.timelineSteps.length === 0 ? (
                              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 mb-2">Belum ada timeline yang ditambahkan</p>
                                <p className="text-xs text-gray-500 mb-3">Tambahkan tahapan-tahapan pengembangan proyek</p>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={addTimelineStep}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Tambah Tahapan
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {formData.timelineSteps.map((step, index) => (
                                  <Card key={index} className="border border-gray-200">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold">Tahapan {index + 1}</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeTimelineStep(index)}
                                        >
                                          <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </div>
                                      
                                      <div className="grid gap-3">
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Judul Tahapan</label>
                                          <Input
                                            placeholder="e.g. Planning & Research"
                                            value={step.title}
                                            onChange={(e) => updateTimelineStep(index, "title", e.target.value)}
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Status</label>
                                          <Select
                                            value={step.status}
                                            onValueChange={(value) => updateTimelineStep(index, "status", value)}
                                          >
                                            <SelectTrigger className="w-full">
                                              <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {TIMELINE_STATUS_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                  <div className="flex items-center">
                                                    <span 
                                                      className="h-2 w-2 rounded-full mr-2"
                                                      style={{ backgroundColor: option.color || '#6B7280' }}
                                                    ></span>
                                                    <span>{option.label}</span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Tags (Opsional)</label>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Tambahkan tag (e.g. IoT, Smart Campus)"
                                id="tag-input"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.currentTarget as HTMLInputElement;
                                    if (input.value.trim() && !formData.tags.includes(input.value.trim())) {
                                      handleInputChange("tags", [...formData.tags, input.value.trim()]);
                                      input.value = '';
                                    }
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const input = document.getElementById('tag-input') as HTMLInputElement;
                                  if (input.value.trim() && !formData.tags.includes(input.value.trim())) {
                                    handleInputChange("tags", [...formData.tags, input.value.trim()]);
                                    input.value = '';
                                  }
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {formData.tags.length > 0 ? (
                                formData.tags.map((tag, tagIndex) => (
                                  <Badge key={`${tag}-${tagIndex}`} variant="secondary" className="text-xs py-1 px-2 flex items-center gap-1">
                                    {tag}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 hover:bg-red-100"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleInputChange(
                                          "tags", 
                                          formData.tags.filter(t => t !== tag)
                                        );
                                      }}
                                    >
                                      <X className="h-3 w-3 text-red-500 hover:text-red-700" />
                                    </Button>
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">Belum ada tag yang ditambahkan</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Tambahkan tag yang relevan dengan proyek ini</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between mt-12 pt-8 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Langkah {currentStep} dari 5</span>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        disabled={isLoading} 
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        onClick={handleCancel}
                      >
                        Batal
                      </Button>

                      {currentStep > 2 && (
                        <Button variant="outline" onClick={handlePrevious} disabled={isLoading}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Kembali
                        </Button>
                      )}

                      {currentStep < 5 ? (
                        <Button 
                          onClick={handleNext} 
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Menyimpan...</span>
                            </div>
                          ) : (
                            <>
                              Lanjutkan
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Memperbarui Proyek...</span>
                            </div>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Simpan Perubahan
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}