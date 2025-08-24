"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, Eye, EyeOff, Chrome, ArrowLeft, AlertCircle, CheckCircle, User, Phone } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  // The process is now simplified to 2 steps
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    fullName: "",
    email: "",
    phone: "", // Added phone number
    password: "",
    confirmPassword: "",

    // Step 2: Agreement
    agreeTerms: false,
    agreePrivacy: false,
    subscribeNewsletter: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState("")

  // Validation for the first step (Basic Info)
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

    if (!formData.phone) {
        newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^(08)\d{8,11}$/.test(formData.phone)) {
        newErrors.phone = "Format nomor telepon tidak valid (contoh: 081234567890)";
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

  // Validation for the second step (Agreement)
  const validateStep2 = () => {
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

  // Moves from Step 1 to Step 2
  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  // Handles the final form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) return

    setIsLoading(true)
    setApiError("")

    try {
      // This object structure matches the backend requirements
      const userData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone 
      }

      const response = await api.register(userData)
      
      console.log("Registration successful:", response.message)
      
      // Redirect to login page upon success
      router.push("/login")
    } catch (error: unknown) {
      console.error("Registration failed:", error)
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string }
      if (errorObj.response?.data?.message) {
        setApiError(errorObj.response.data.message)
      } else if (typeof errorObj.message === 'string') {
        setApiError(errorObj.message)
      } else {
        setApiError("Registration failed. Please try again or contact support.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
        return "Selesaikan Pendaftaran"
      default:
        return "Daftar"
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Masukkan informasi dasar untuk akun Anda"
      case 2:
        return "Setujui syarat dan ketentuan untuk menyelesaikan"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bergabung dengan Komunitas</h1>
          <p className="text-gray-600">Mulai kolaborasi dengan mahasiswa se-Indonesia</p>
        </motion.div>

        {/* Progress Indicator (updated for 2 steps) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-2 px-16">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step <= currentStep
                    ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-16">
            <span>Dasar</span>
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

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.phone && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.phone}</span>
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

                  <Button onClick={handleNext} className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">
                    Lanjutkan
                  </Button>
                </div>
              )}

              {/* Step 2: Terms and Completion */}
              {currentStep === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* API Error Message */}
                  {apiError && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200 mb-4">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <p className="text-sm font-medium">{apiError}</p>
                      </div>
                    </div>
                  )}
                  
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
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 bg-transparent"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
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

                  <div className="grid gap-3">
                    <Button variant="outline" onClick={() => handleSocialRegister("google")} className="bg-transparent">
                      <Chrome className="h-4 w-4 mr-2" />
                      Google
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
