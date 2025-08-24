"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Minus,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { api } from "@/lib/api"
import { TimelineStatusOption } from "@/types"

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

export default function CreateProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [projectId, setProjectId] = useState<string | null>(null) // Add projectID state
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
    teamSize: 2, // Changed from "" to 2 (number)
    budget: "", // Added budget field
    deadline: "", // Added deadline field
    existingMembers: [
      {
        name: "",
        role: "",
        description: "", // Add description field
        skills: [] as string[],
      },
    ], // Added existing team members

    // Step 3: Requirements
    requiredSkills: [] as string[],
    experience: "",
    commitment: "",
    requirements: [] as string[], // Changed from string to string[]

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
    benefits: [] as string[], // Changed from string to string[]
    timelineSteps: [] as { 
      title: string;
      status: "not-started" | "in-progress" | "done";
    }[],
    tags: [] as string[],
  })

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Judul proyek wajib diisi"
      if (!formData.type) newErrors.type = "Tipe proyek wajib dipilih"
      if (!formData.description.trim()) newErrors.description = "Deskripsi proyek wajib diisi"
      if (formData.description.length < 50) newErrors.description = "Deskripsi minimal 50 karakter"
      if (!formData.image) newErrors.image = "Gambar proyek wajib diunggah"
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
    if (!validateStep(currentStep)) return

    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        addToast({
          title: "Error",
          description: "Please login to create a project",
          type: "error",
        })
        setIsLoading(false)
        return
      }

      // Stage 1: Create Project
      if (currentStep === 1) {
        const stage1FormData = new FormData()
        stage1FormData.append("title", formData.title)
        stage1FormData.append("project_type", formData.type)
        stage1FormData.append("description", formData.description)
        if (formData.image) {
          stage1FormData.append("picture", formData.image)
        }

        const response = await api.createProject(token, stage1FormData)
        console.log("Project created:", response)
        
        // Extract project ID from response
        if (response.data && response.data.id) {
          setProjectId(response.data.id.toString())
        } else if (response.id) {
          setProjectId(response.id.toString())
        } else {
          throw new Error("Project ID not received from server")
        }

        addToast({
          title: "Project Created!",
          description: "Basic project information has been saved.",
          type: "success",
        })
      }

      // Stage 2: Update Project Details
      else if (currentStep === 2 && projectId) {
        // Helper function to format date to RFC3339 format
        const formatDateToRFC3339 = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString(); // This gives RFC3339 format
        };

        const stage2Data = {
          duration: formData.duration,
          total_team: formData.teamSize,
          start_date: formatDateToRFC3339(formData.startDate),
          end_date: formData.endDate ? formatDateToRFC3339(formData.endDate) : undefined,
          location: formData.location,
          budget: formData.budget || undefined, // Send as string, no parsing needed
          registration_deadline: formatDateToRFC3339(formData.deadline),
        }

        console.log("Stage 2 data being sent:", stage2Data);

        await api.updateProjectStage2(token, projectId, stage2Data)
        console.log("Stage 2 updated:", stage2Data)

        addToast({
          title: "Project Details Updated!",
          description: "Project timeline and details have been saved.",
          type: "success",
        })
      }

      // Stage 3: Update Project Requirements
      else if (currentStep === 3 && projectId) {
        const stage3Data = {
          time_commitment: formData.commitment,
          required_skills: formData.requiredSkills.map(skill => ({ name: skill })),
          conditions: formData.requirements.filter(req => req.trim()).map(req => ({ description: req })),
        }

        await api.updateProjectStage3(token, projectId, stage3Data)
        console.log("Stage 3 updated:", stage3Data)

        addToast({
          title: "Requirements Updated!",
          description: "Project requirements and skills have been saved.",
          type: "success",
        })
      }

      // Stage 4: Update Team & Roles
      else if (currentStep === 4 && projectId) {
        const stage4Data = {
          roles: formData.roles.filter(role => role.title.trim()).map(role => ({
            name: role.title,
            slots_available: role.count,
            description: role.description,
            skill_names: role.skills,
          })),
          // Only include members that have both name and role filled out
          // and where the name is not empty/placeholder
          members: formData.existingMembers
            .filter(member => 
              member.name.trim() && 
              member.role.trim() && 
              member.name.trim() !== "" &&
              member.name.trim().length > 2 // Ensure it's a real name, not just initials
            )
            .map(member => ({
              name: member.name,
              role_name: member.role,
              role_description: member.description,
              skill_names: member.skills,
            })),
        }

        console.log('Stage 4 data being sent:', stage4Data);

        await api.updateProjectStage4(token, projectId, stage4Data)
        console.log("Stage 4 updated:", stage4Data)

        addToast({
          title: "Team & Roles Updated!",
          description: "Team structure and roles have been saved.",
          type: "success",
        })
      }

      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error("Error in stage submission:", error)
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save project data",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return
    if (!projectId) {
      addToast({
        title: "Error",
        description: "Project ID not found. Please start over.",
        type: "error",
      })
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        addToast({
          title: "Error",
          description: "Please login to create a project",
          type: "error",
        })
        setIsLoading(false)
        return
      }

      // Stage 5: Finalize Project
      const stage5Data = {
        benefits: formData.benefits.filter(benefit => benefit.trim()).map(benefit => ({ description: benefit })),
        timeline: formData.timelineSteps.filter(step => step.title.trim()).map(step => ({
          name: step.title,  // Changed from 'title' to 'name' to match backend expectation
          status: step.status,
        })),
        tags: formData.tags.map(tag => ({ name: tag })),
      }

      await api.updateProjectStage5(token, projectId, stage5Data)
      console.log("Stage 5 updated:", stage5Data)

      addToast({
        title: "Proyek Berhasil Dibuat!",
        description: "Proyek Anda telah berhasil dibuat dan siap untuk menerima kolaborator.",
        type: "success",
        duration: 5000
      })
      
      // Redirect to projects page after success
      setTimeout(() => {
        router.push("/projects")
      }, 1500)
      
    } catch (error) {
      console.error("Error in final submission:", error)
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to finalize project",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Add these new functions for skills/tags
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

  const updateRole = (index: number, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.map((role, i) => (i === index ? { ...role, [field]: value } : role)),
    }))
  }

  // Add these new functions for managing role skills
  const addRoleSkill = (roleIndex: number, skill: string) => {
    if (skill.trim() && !formData.roles[roleIndex].skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        roles: prev.roles.map((role, i) => 
          i === roleIndex 
            ? { ...role, skills: [...role.skills, skill.trim()] }
            : role
        )
      }));
    }
  }

  const removeRoleSkill = (roleIndex: number, skill: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map((role, i) => 
        i === roleIndex 
          ? { ...role, skills: role.skills.filter(s => s !== skill) }
          : role
      )
    }));
  }

  // Add these new functions for managing member skills
  const addMemberSkill = (memberIndex: number, skill: string) => {
    if (skill.trim() && !formData.existingMembers[memberIndex].skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        existingMembers: prev.existingMembers.map((member, i) => 
          i === memberIndex 
            ? { ...member, skills: [...member.skills, skill.trim()] }
            : member
        )
      }));
    }
  }

  const removeMemberSkill = (memberIndex: number, skill: string) => {
    setFormData(prev => ({
      ...prev,
      existingMembers: prev.existingMembers.map((member, i) => 
        i === memberIndex 
          ? { ...member, skills: member.skills.filter(s => s !== skill) }
          : member
      )
    }));
  }
  
  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...prev.requiredSkills, skill],
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

  const updateExistingMember = (index: number, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      existingMembers: prev.existingMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      ),
    }))
  }

  // Add these functions for timeline steps management
  const addTimelineStep = () => {
    setFormData((prev) => ({
      ...prev,
      timelineSteps: [
        ...prev.timelineSteps,
        { title: "", description: "", status: "not-started" as const }
      ],
    }))
  }

  const removeTimelineStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      timelineSteps: prev.timelineSteps.filter((_, i) => i !== index),
    }))
  }

  const updateTimelineStep = (index: number, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      timelineSteps: prev.timelineSteps.map((step, i) => (
        i === index ? { ...step, [field]: value } : step
      )),
    }))
  }

  const toggleMemberSkill = (memberIndex: number, skill: string) => {
    setFormData((prev) => ({
      ...prev,
      existingMembers: prev.existingMembers.map((member, i) => {
        if (i === memberIndex) {
          const newSkills = member.skills.includes(skill)
            ? member.skills.filter((s) => s !== skill)
            : [...member.skills, skill]
          return { ...member, skills: newSkills }
        }
        return member
      }),
    }))
  }

  // Add image handling functions
  const handleImageUpload = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        title: "Error",
        description: "Please upload a valid image file (JPG, PNG, or WebP)",
        type: "error",
      });
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      addToast({
        title: "Error", 
        description: "File size must be less than 2MB",
        type: "error",
      });
      return;
    }

    handleInputChange("image", file);
    addToast({
      title: "Success",
      description: "Image uploaded successfully",
      type: "success",
    });
  };

  const handleImageRemove = () => {
    handleInputChange("image", null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Menghitung jumlah anggota yang sudah ditambahkan + pembuat proyek
  const filledSlots = 1 + formData.existingMembers.filter(member => member.name.trim() && member.role.trim()).length;

  // Menghitung sisa slot total di dalam tim
  const remainingSlots = formData.teamSize - filledSlots;

  // Menghitung total slot yang sudah didefinisikan dari semua role
  const totalDefinedSlots = formData.roles.reduce((acc, role) => acc + role.count, 0);

  // Menghitung berapa anggota yang sudah ditugaskan ke sebuah role spesifik
  const getAssignedCountForRole = (roleTitle: string) => {
    return formData.existingMembers.filter(member => member.role === roleTitle).length;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Informasi Dasar"
      case 2:
        return "Detail Proyek"
      case 3:
        return "Persyaratan"
      case 4:
        return "Tim & Role"
      case 5:
        return "Finalisasi"
      default:
        return "Buat Proyek"
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
                       
                                    <Image 
                                      src="/synergazing.svg" 
                                      alt="Synergazing Logo" 
                                      width={20} 
                                      height={20} 
                                      className="text-white" 
                                    />
                                  
                      </div>
                      <span className="font-bold">Buat Proyek</span>
                    </div>

                    <div className="space-y-4">
                      {[
                        { step: 1, title: "Informasi Dasar", icon: Briefcase },
                        { step: 2, title: "Detail Proyek", icon: Calendar },
                        { step: 3, title: "Persyaratan", icon: Target },
                        { step: 4, title: "Tim & Role", icon: Users },
                        { step: 5, title: "Finalisasi", icon: CheckCircle },
                      ].map(({ step, title, icon: Icon }) => (
                        <div
                          key={step}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            step === currentStep
                              ? "bg-white shadow-sm border border-blue-200"
                              : step < currentStep
                                ? "bg-green-50 text-green-700"
                                : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              step === currentStep
                                ? "bg-blue-600 text-white"
                                : step < currentStep
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200"
                            }`}
                          >
                            {step < currentStep ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                          </div>
                          <span className="text-sm font-medium">{title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium">{Math.round((currentStep / 5) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(currentStep / 5) * 100}%` }}
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
                    <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
                    <p className="text-gray-600 mt-2">Langkah {currentStep} dari 5</p>
                  </div>

                  {/* Form Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      {/* Step 1: Basic Information */}
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
                            {errors.type && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.type}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Deskripsi Proyek *</label>
                            <Textarea
                              placeholder="Jelaskan proyek Anda secara detail. Apa tujuannya, apa yang akan dibangun, dan mengapa proyek ini menarik..."
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

                          <div>
                            <label className="block text-sm font-medium mb-2">Gambar Proyek *</label>
                            {formData.image ? (
                              // Image Preview
                              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                      src={URL.createObjectURL(formData.image)}
                                      alt="Project preview"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{formData.image.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleImageRemove}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Hapus
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // Upload Area
                              <div 
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => document.getElementById('image-upload')?.click()}
                              >
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">Upload gambar untuk proyek Anda</p>
                                <p className="text-xs text-gray-500 mb-4">
                                  Drag & drop atau klik untuk memilih file
                                </p>
                                <Button type="button" variant="outline" size="sm">
                                  Pilih File
                                </Button>
                                <p className="text-xs text-gray-400 mt-2">
                                  JPG, PNG, atau WebP (Max 2MB)
                                </p>
                              </div>
                            )}
                            
                            {/* Hidden file input */}
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(file);
                                }
                              }}
                            />
                            {errors.image && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.image}
                              </p>
                            )}
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
                            
                            <p className="text-xs text-gray-500 mt-1">
                              Tambahkan skill teknis, teknologi, atau tag yang relevan dengan proyek ini
                            </p>
                            
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
                          {/* ===== PERUBAHAN 1: Judul dan Info Kapasitas Tim ===== */}
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
                            {/* ===== PERUBAHAN 2: Ganti Judul Seksi ===== */}
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
                                      {/* ===== PERUBAHAN 3: Ganti "Jumlah Orang" menjadi "Total Slot" ===== */}
                                      <label className="block text-sm font-medium mb-2">Total Slot</label>
                                      <Select
                                        value={role.count.toString()}
                                        onValueChange={(value) => updateRole(index, "count", Number.parseInt(value))}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {/* Membuat opsi dinamis agar tidak melebihi total tim */}
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
                                  
                                  {/* ===== PERUBAHAN 4: Tambah Tampilan "Slot Tersedia" (Otomatis) ===== */}
                                  <div className="mb-4">
                                      <label className="block text-sm font-medium mb-2">Slot Tersedia</label>
                                      <Input
                                        readOnly
                                        disabled
                                        value={`${Math.max(0, role.count - getAssignedCountForRole(role.title))} slot tersedia`}
                                        className="bg-gray-100 font-medium"
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

                          {/* ===== PERUBAHAN 5: Logika Tombol "Tambah Anggota" ===== */}
                          <div className="mt-8">
                              <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-medium">Anggota Tim yang Sudah Ada</h3>
                                  <Button 
                                      onClick={addExistingMember} 
                                      size="sm" 
                                      variant="outline"
                                      disabled={remainingSlots <= 0} // Nonaktifkan jika slot sudah penuh
                                  >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Tambah Anggota
                                  </Button>
                              </div>
                              {remainingSlots <= 0 && formData.existingMembers.length > 0 && (
                                   <p className="text-sm text-yellow-700 mb-4">
                                      Kapasitas tim sudah penuh. Anda tidak dapat menambahkan anggota lagi.
                                  </p>
                              )}

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
                                      <p className="text-xs text-yellow-600 mt-1">
                                        ⚠️ Harus sesuai dengan nama user yang sudah terdaftar di sistem
                                      </p>
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
                                              Silakan definisikan role terlebih dahulu di bagian &ldquo;Role pada Project Ini&rdquo; di atas
                                            </p>
                                          </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Add description field */}
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


                          {/* <div>
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
                          </div> */}
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
                      {currentStep > 1 && (
                        <Button variant="outline" onClick={handlePrevious}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Kembali
                        </Button>
                      )}

                      {currentStep < 5 ? (
                        <Button onClick={handleNext} className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">
                          Lanjutkan
                          <ArrowRight className="h-4 w-4 ml-2" />
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
                              <span>Membuat Proyek...</span>
                            </div>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Buat Proyek
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
