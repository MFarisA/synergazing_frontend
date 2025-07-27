"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Mail, Lock, Eye, EyeOff, Github, Chrome, ArrowLeft, AlertCircle, CheckCircle, User } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const universities = [
  "Institut Teknologi Bandung",
  "Universitas Indonesia",
  "Universitas Gadjah Mada",
  "Institut Teknologi Sepuluh Nopember",
  "Universitas Padjadjaran",
  "Universitas Brawijaya",
  "Universitas Diponegoro",
  "Universitas Hasanuddin",
  "Universitas Sumatera Utara",
  "Lainnya",
]

const majors = [
  "Teknik Informatika",
  "Sistem Informasi",
  "Teknik Komputer",
  "Desain Komunikasi Visual",
  "Teknik Elektro",
  "Teknik Mesin",
  "Manajemen",
  "Ekonomi",
  "Psikologi",
  "Lainnya",
]

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Step 2: Academic Info
    university: "",
    major: "",
    year: "",

    // Step 3: Agreement
    agreeTerms: false,
    agreePrivacy: false,
    subscribeNewsletter: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nama lengkap wajib diisi"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Nama minimal 2 karakter"
    }

    if (!formData.email) {
      newErrors.email = "Email wajib diisi"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid"
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password harus mengandung huruf besar, kecil, dan angka"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.university) {
      newErrors.university = "Universitas wajib dipilih"
    }

    if (!formData.major) {
      newErrors.major = "Jurusan wajib dipilih"
    }

    if (!formData.year) {
      newErrors.year = "Tahun/semester wajib dipilih"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Anda harus menyetujui syarat dan ketentuan"
    }

    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = "Anda harus menyetujui kebijakan privasi"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    let isValid = false

    if (currentStep === 1) {
      isValid = validateStep1()
    } else if (currentStep === 2) {
      isValid = validateStep2()
    }

    if (isValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep3()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      console.log("Registration attempt:", formData)
      // Here you would typically handle the registration logic
    }, 2000)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSocialRegister = (provider: string) => {
    console.log(`Register with ${provider}`)
    // Handle social registration
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Informasi Dasar"
      case 2:
        return "Informasi Akademik"
      case 3:
        return "Selesaikan Pendaftaran"
      default:
        return "Daftar"
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Masukkan informasi dasar Anda"
      case 2:
        return "Ceritakan tentang latar belakang akademik Anda"
      case 3:
        return "Setujui syarat dan ketentuan untuk menyelesaikan pendaftaran"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl">Synergizing.space</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bergabung dengan Komunitas</h1>
          <p className="text-gray-600">Mulai kolaborasi dengan mahasiswa se-Indonesia</p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step <= currentStep
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Dasar</span>
            <span>Akademik</span>
            <span>Selesai</span>
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center">{getStepTitle()}</CardTitle>
              <CardDescription className="text-center">{getStepDescription()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className={`pl-10 ${errors.fullName ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.fullName && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.fullName}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>

                  <Button onClick={handleNext} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Lanjutkan
                  </Button>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {/* University */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Universitas</label>
                    <Select
                      value={formData.university}
                      onValueChange={(value) => handleInputChange("university", value)}
                    >
                      <SelectTrigger className={errors.university ? "border-red-500" : ""}>
                        <SelectValue placeholder="Pilih universitas" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((uni) => (
                          <SelectItem key={uni} value={uni}>
                            {uni}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.university && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.university}</span>
                      </div>
                    )}
                  </div>

                  {/* Major */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Jurusan</label>
                    <Select value={formData.major} onValueChange={(value) => handleInputChange("major", value)}>
                      <SelectTrigger className={errors.major ? "border-red-500" : ""}>
                        <SelectValue placeholder="Pilih jurusan" />
                      </SelectTrigger>
                      <SelectContent>
                        {majors.map((major) => (
                          <SelectItem key={major} value={major}>
                            {major}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.major && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.major}</span>
                      </div>
                    )}
                  </div>

                  {/* Year/Semester */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tahun/Semester</label>
                    <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                      <SelectTrigger className={errors.year ? "border-red-500" : ""}>
                        <SelectValue placeholder="Pilih tahun/semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semester-1">Semester 1</SelectItem>
                        <SelectItem value="semester-2">Semester 2</SelectItem>
                        <SelectItem value="semester-3">Semester 3</SelectItem>
                        <SelectItem value="semester-4">Semester 4</SelectItem>
                        <SelectItem value="semester-5">Semester 5</SelectItem>
                        <SelectItem value="semester-6">Semester 6</SelectItem>
                        <SelectItem value="semester-7">Semester 7</SelectItem>
                        <SelectItem value="semester-8">Semester 8</SelectItem>
                        <SelectItem value="alumni">Alumni</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.year && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.year}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 bg-transparent">
                      Kembali
                    </Button>
                    <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                      Lanjutkan
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Terms and Completion */}
              {currentStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Terms Agreement */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                        className={errors.agreeTerms ? "border-red-500" : ""}
                      />
                      <label htmlFor="agreeTerms" className="text-sm text-gray-600 leading-relaxed">
                        Saya menyetujui{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Syarat dan Ketentuan
                        </Link>{" "}
                        penggunaan platform Synergizing.space
                      </label>
                    </div>
                    {errors.agreeTerms && (
                      <div className="flex items-center gap-1 text-red-500 text-sm ml-6">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.agreeTerms}</span>
                      </div>
                    )}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreePrivacy"
                        checked={formData.agreePrivacy}
                        onCheckedChange={(checked) => handleInputChange("agreePrivacy", checked as boolean)}
                        className={errors.agreePrivacy ? "border-red-500" : ""}
                      />
                      <label htmlFor="agreePrivacy" className="text-sm text-gray-600 leading-relaxed">
                        Saya menyetujui{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Kebijakan Privasi
                        </Link>{" "}
                        dan penggunaan data pribadi saya
                      </label>
                    </div>
                    {errors.agreePrivacy && (
                      <div className="flex items-center gap-1 text-red-500 text-sm ml-6">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.agreePrivacy}</span>
                      </div>
                    )}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="subscribeNewsletter"
                        checked={formData.subscribeNewsletter}
                        onCheckedChange={(checked) => handleInputChange("subscribeNewsletter", checked as boolean)}
                      />
                      <label htmlFor="subscribeNewsletter" className="text-sm text-gray-600 leading-relaxed">
                        Saya ingin menerima newsletter dan update tentang proyek-proyek menarik (opsional)
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 bg-transparent"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Mendaftar...</span>
                        </div>
                      ) : (
                        "Buat Akun"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Social Registration (only on step 1) */}
              {currentStep === 1 && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Atau daftar dengan</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => handleSocialRegister("google")} className="bg-transparent">
                      <Chrome className="h-4 w-4 mr-2" />
                      Google
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialRegister("github")} className="bg-transparent">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </div>
                </>
              )}

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline font-medium">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke beranda</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
