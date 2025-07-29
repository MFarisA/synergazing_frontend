"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"

const projectTypes = [
  { value: "lomba", label: "Lomba", description: "Kompetisi atau hackathon" },
  { value: "riset", label: "Riset Dosen", description: "Penelitian dengan dosen pembimbing" },
  { value: "portolatihan", label: "Portofolio Latihan", description: "Proyek untuk berlatih berkolaborasi" },
  { value: "kuliah", label: "Tugas Kuliah", description: "Proyek mata kuliah" },
  { value: "open-source", label: "Open Source", description: "Proyek open source" },
  { value: "social", label: "Social Impact", description: "Proyek dampak sosial" },
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
    teamSize: "",

    // Step 3: Requirements
    requiredSkills: [] as string[],
    experience: "",
    commitment: "",
    requirements: "",

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
    benefits: "",
    timeline: "",
    isUrgent: false,
    allowRemote: false,
    provideMentoring: false,
    tags: [] as string[],
  })

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
      if (!formData.teamSize) newErrors.teamSize = "Ukuran tim wajib diisi"
    }

    if (step === 3) {
      if (formData.requiredSkills.length === 0) newErrors.requiredSkills = "Minimal pilih 1 skill yang dibutuhkan"
      if (!formData.experience) newErrors.experience = "Level pengalaman wajib dipilih"
      if (!formData.commitment) newErrors.commitment = "Komitmen waktu wajib diisi"
    }

    if (step === 4) {
      const hasValidRole = formData.roles.some((role) => role.title.trim() && role.description.trim())
      if (!hasValidRole) newErrors.roles = "Minimal tambahkan 1 role yang dibutuhkan"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      console.log("Project created:", formData)
      // Redirect to project page or projects list
      router.push("/projects")
    }, 2000)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
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

  const updateRole = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.map((role, i) => (i === index ? { ...role, [field]: value } : role)),
    }))
  }

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...prev.requiredSkills, skill],
    }))
  }

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

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Progress */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-gradient-to-b from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
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
                          className="bg-gradient-to-r from-[#0088FF] to-[#CB30E0] h-2 rounded-full transition-all duration-300"
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
                            <label className="block text-sm font-medium mb-2">Gambar Proyek (Opsional)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 mb-4">Upload gambar untuk proyek Anda</p>
                              <Button variant="outline" size="sm">
                                Pilih File
                              </Button>
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
                              <Select
                                value={formData.teamSize}
                                onValueChange={(value) => handleInputChange("teamSize", value)}
                              >
                                <SelectTrigger className={errors.teamSize ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Jumlah anggota" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2-3">2-3 orang</SelectItem>
                                  <SelectItem value="4-5">4-5 orang</SelectItem>
                                  <SelectItem value="6-8">6-8 orang</SelectItem>
                                  <SelectItem value="9-12">9-12 orang</SelectItem>
                                  <SelectItem value="lebih-12">Lebih dari 12 orang</SelectItem>
                                </SelectContent>
                              </Select>
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
                            <label className="block text-sm font-medium mb-2">Lokasi & Tipe Kerja *</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                              <Select
                                value={formData.workType}
                                onValueChange={(value) => handleInputChange("workType", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Tipe kerja" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="remote">Full Remote</SelectItem>
                                  <SelectItem value="onsite">On-site</SelectItem>
                                  <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {errors.location && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.location}
                              </p>
                            )}
                          </div>

                        </div>
                      )}

                      {/* Step 3: Requirements */}
                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Skills yang Dibutuhkan *</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                              {skillOptions.map((skill) => (
                                <div key={skill} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={skill}
                                    checked={formData.requiredSkills.includes(skill)}
                                    onCheckedChange={() => toggleSkill(skill)}
                                  />
                                  <label htmlFor={skill} className="text-sm">
                                    {skill}
                                  </label>
                                </div>
                              ))}
                            </div>
                            {formData.requiredSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {formData.requiredSkills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
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
                            <Textarea
                              placeholder="Jelaskan persyaratan khusus, kualifikasi, atau ekspektasi lainnya..."
                              value={formData.requirements}
                              onChange={(e) => handleInputChange("requirements", e.target.value)}
                              className="min-h-[100px] resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Step 4: Team & Roles */}
                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Role yang Dibutuhkan</h3>
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

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-2">Nama Role</label>
                                      <Input
                                        placeholder="e.g. Frontend Developer"
                                        value={role.title}
                                        onChange={(e) => updateRole(index, "title", e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-2">Jumlah Orang</label>
                                      <Select
                                        value={role.count.toString()}
                                        onValueChange={(value) => updateRole(index, "count", Number.parseInt(value))}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {[1, 2, 3, 4, 5].map((num) => (
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
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                                      {skillOptions.map((skill) => (
                                        <div key={skill} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`${index}-${skill}`}
                                            checked={role.skills.includes(skill)}
                                            onCheckedChange={(checked) => {
                                              const newSkills = checked
                                                ? [...role.skills, skill]
                                                : role.skills.filter((s) => s !== skill)
                                              updateRole(index, "skills", newSkills)
                                            }}
                                          />
                                          <label htmlFor={`${index}-${skill}`} className="text-xs">
                                            {skill}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                    {role.skills.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {role.skills.map((skill) => (
                                          <Badge key={skill} variant="secondary" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
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
                        </div>
                      )}

                      {/* Step 5: Finalization */}
                      {currentStep === 5 && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Benefit untuk Kolaborator</label>
                            <Textarea
                              placeholder="Apa yang akan didapatkan kolaborator? (e.g. sertifikat, pengalaman, networking, dll.)"
                              value={formData.benefits}
                              onChange={(e) => handleInputChange("benefits", e.target.value)}
                              className="min-h-[100px] resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Timeline Detail (Opsional)</label>
                            <Textarea
                              placeholder="Jelaskan timeline proyek secara detail, milestone, dan deliverables..."
                              value={formData.timeline}
                              onChange={(e) => handleInputChange("timeline", e.target.value)}
                              className="min-h-[100px] resize-none"
                            />
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="isUrgent"
                                checked={formData.isUrgent}
                                onCheckedChange={(checked) => handleInputChange("isUrgent", checked)}
                              />
                              <label htmlFor="isUrgent" className="text-sm">
                                Proyek ini urgent dan butuh segera dimulai
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="allowRemote"
                                checked={formData.allowRemote}
                                onCheckedChange={(checked) => handleInputChange("allowRemote", checked)}
                              />
                              <label htmlFor="allowRemote" className="text-sm">
                                Memungkinkan kerja remote untuk kolaborator
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="provideMentoring"
                                checked={formData.provideMentoring}
                                onCheckedChange={(checked) => handleInputChange("provideMentoring", checked)}
                              />
                              <label htmlFor="provideMentoring" className="text-sm">
                                Menyediakan mentoring dan guidance untuk tim
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Tags (Opsional)</label>
                            <Input
                              placeholder="Tambahkan tags yang relevan, pisahkan dengan koma"
                              value={formData.tags.join(", ")}
                              onChange={(e) =>
                                handleInputChange(
                                  "tags",
                                  e.target.value.split(",").map((tag) => tag.trim()),
                                )
                              }
                            />
                            <p className="text-xs text-gray-500 mt-1">e.g. IoT, Smart Campus, Real-time, Dashboard</p>
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
                      {currentStep > 1 && (
                        <Button variant="outline" onClick={handlePrevious}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Kembali
                        </Button>
                      )}

                      {currentStep < 5 ? (
                        <Button onClick={handleNext} className="bg-gradient-to-r from-[#0088FF] to-[#CB30E0]">
                          Lanjutkan
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[#0088FF] to-[#CB30E0]"
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
