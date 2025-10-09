"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, Eye, EyeOff, Chrome, ArrowLeft, AlertCircle, CheckCircle, User, Phone } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { registerInitiate, registerComplete, verifyOTP, resendOTP } from "@/lib/api/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002'

export default function RegisterPage() {
  const router = useRouter()
  // The process is now 3 steps: Basic Info -> OTP Verification -> Agreement
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    fullName: "",
    email: "",
    phone: "", // Added phone number
    password: "",
    confirmPassword: "",

    // Step 2: OTP Verification
    otpCode: "",

    // Step 3: Agreement
    agreeTerms: false,
    agreePrivacy: false,
    subscribeNewsletter: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState<"error" | "warning" | "success" | "">("")
  const [resendTimer, setResendTimer] = useState(0)
  const [canResendOTP, setCanResendOTP] = useState(false)

  // Timer effect for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (resendTimer > 0) {
      setCanResendOTP(false)
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResendOTP(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setCanResendOTP(true)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [resendTimer])

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
    } else if (!/^\+\d{8,15}$/.test(formData.phone)) {
        newErrors.phone = "Format nomor telepon tidak valid (contoh: +628112444123)";
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

  // Validation for the second step (OTP)
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.otpCode) {
      newErrors.otpCode = "Kode OTP wajib diisi"
    } else if (!/^\d{6}$/.test(formData.otpCode)) {
      newErrors.otpCode = "Kode OTP harus 6 digit angka"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validation for the third step (Agreement)
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

  // Moves from Step 1 to Step 2 (initiate registration and send OTP)
  const handleNext = async () => {
    if (!validateStep1()) return

    setIsLoading(true)
    setApiError("")
    setAlertMessage("")
    setAlertType("")

    try {
      const userData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone 
      }

      const response = await registerInitiate(userData)
      
      // Show success message and move to OTP step
      setAlertMessage("Kode OTP telah dikirim ke email Anda. Silakan periksa inbox atau folder spam.")
      setAlertType("success")
      setCurrentStep(2)
      setResendTimer(10) // Start 10-second timer
      setCanResendOTP(false)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string }
      // Don't expose backend error messages to users
      setApiError("Gagal mengirim OTP")
      setAlertMessage("Gagal mengirim OTP. Silakan periksa email Anda dan coba lagi.")
      setAlertType("error")
    } finally {
      setIsLoading(false)
    }
  }

  // Moves from Step 2 to Step 3 (skip separate verification, go directly to step 3)
  const handleVerifyOTP = async () => {
    if (!validateStep2()) return

    // Simply move to step 3 without separate verification
    // The OTP will be verified during final registration completion
    setAlertMessage("Kode OTP siap untuk verifikasi final!")
    setAlertType("success")
    setCurrentStep(3)
  }

  // Resend OTP function
  const handleResendOTP = async () => {
    if (!canResendOTP || isLoading) return

    setIsLoading(true)
    setApiError("")
    setAlertMessage("")
    setAlertType("")

    try {
      const response = await resendOTP(formData.email)
      
      setAlertMessage("Kode OTP baru telah dikirim ke email Anda.")
      setAlertType("success")
      setResendTimer(10) // Restart 10-second timer
      setCanResendOTP(false)
      
      // Clear the current OTP input
      setFormData((prev) => ({ ...prev, otpCode: "" }))
    } catch (error: unknown) {
      console.error('Resend OTP frontend error:', error)
      
      let userMessage = "Gagal mengirim ulang kode OTP. Silakan coba lagi."
      let apiErrorMsg = "Gagal mengirim ulang OTP"
      
      // Handle different types of errors
      if (error && typeof error === 'object') {
        const errorObj = error as { 
          response?: { data?: { message?: string } }; 
          message?: string; 
          type?: string;
          status?: number;
          statusText?: string;
        }
        
        // Network error
        if (errorObj.type === 'NETWORK_ERROR') {
          userMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
          apiErrorMsg = "Koneksi bermasalah"
        }
        // Server error
        else if (errorObj.status === 500) {
          userMessage = "Terjadi kesalahan server. Silakan coba lagi dalam beberapa saat."
          apiErrorMsg = "Error server"
        }
        // Not found error (endpoint doesn't exist)
        else if (errorObj.status === 404) {
          userMessage = "Layanan tidak tersedia saat ini. Silakan hubungi support."
          apiErrorMsg = "Layanan tidak tersedia"
        }
        // Rate limiting or too many requests
        else if (errorObj.status === 429) {
          userMessage = "Terlalu banyak permintaan. Silakan tunggu sebelum mencoba lagi."
          apiErrorMsg = "Terlalu banyak permintaan"
        }
        // Email not found or other client errors
        else if (errorObj.status === 400 || errorObj.status === 422) {
          userMessage = "Email tidak ditemukan atau tidak valid. Silakan periksa email Anda."
          apiErrorMsg = "Email tidak valid"
        }
        // Check for specific backend error messages
        else if (errorObj.response?.data?.message) {
          const backendMessage = errorObj.response.data.message.toLowerCase()
          if (backendMessage.includes('email')) {
            userMessage = "Email tidak ditemukan. Silakan periksa email Anda."
            apiErrorMsg = "Email tidak ditemukan"
          } else if (backendMessage.includes('expired') || backendMessage.includes('kadaluarsa')) {
            userMessage = "Sesi registrasi telah kadaluarsa. Silakan mulai ulang pendaftaran."
            apiErrorMsg = "Sesi kadaluarsa"
          }
        }
      }
      
      setApiError(apiErrorMsg)
      setAlertMessage(userMessage)
      setAlertType("error")
    } finally {
      setIsLoading(false)
    }
  }

  // Handles the final form submission (complete registration)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep3()) return

    // Ensure we have an OTP code
    if (!formData.otpCode) {
      setApiError("Kode OTP tidak boleh kosong")
      setAlertMessage("Silakan masukkan kode OTP terlebih dahulu.")
      setAlertType("error")
      setCurrentStep(2) // Go back to OTP step
      return
    }

    setIsLoading(true)
    setApiError("")

    try {
      const userData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        otp_code: formData.otpCode // Use the current OTP code from form
      }

      const response = await registerComplete(userData)
      
      // Show success message and redirect to login page
      setAlertMessage("Pendaftaran berhasil! Anda akan diarahkan ke halaman login.")
      setAlertType("success")
      
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string }
      // Handle specific registration errors without exposing backend messages
      let userMessage = "Pendaftaran gagal. Silakan coba lagi.";
      let apiErrorMsg = "Pendaftaran gagal";
      
      // Check for common registration issues without exposing exact backend message
      if (errorObj.response?.data?.message?.toLowerCase().includes("email") || 
          errorObj.response?.data?.message?.toLowerCase().includes("already exists")) {
        userMessage = "Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang sudah ada.";
        apiErrorMsg = "Email sudah terdaftar";
      } else if (errorObj.response?.data?.message?.toLowerCase().includes("otp") ||
                 errorObj.response?.data?.message?.toLowerCase().includes("invalid")) {
        userMessage = "Kode OTP tidak valid atau sudah kadaluarsa. Silakan minta kode baru.";
        apiErrorMsg = "Kode OTP tidak valid";
      }
      
      setApiError(apiErrorMsg)
      setAlertMessage(userMessage)
      setAlertType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    // Clear alert messages on any input change
    if (alertMessage) {
      setAlertMessage("")
      setAlertType("")
    }
    // Reset timer when going back to step 1
    if (field === "email" && currentStep === 1) {
      setResendTimer(0)
      setCanResendOTP(false)
    }
  }

  const handleSocialRegister = async (provider: string) => {
    if (provider === "google") {
      setIsLoading(true)
      setApiError("")
      setAlertMessage("")
      setAlertType("")

      try {
        // Simply redirect to the backend Google login endpoint
        // The backend will handle the entire OAuth flow and should redirect back
        // to your frontend with the auth data (same endpoint for both login and register)
        window.location.href = `${API_BASE_URL}/api/auth/google/login`
        
      } catch (error: unknown) {
        setAlertType("error")
        setAlertMessage("Google registration gagal. Silakan coba lagi.")
        setApiError("Google registration gagal")
        setIsLoading(false)
      }
    } else {
      console.log(`Register with ${provider}`)
      // Handle other social registration providers
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Informasi Dasar"
      case 2:
        return "Verifikasi OTP"
      case 3:
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
        return "Masukkan kode OTP yang dikirim ke email Anda"
      case 3:
        return "Verifikasi OTP dan setujui syarat ketentuan untuk menyelesaikan pendaftaran"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen from-blue-50 via-white to-purple-50 flex flex-col justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bergabung dengan Synergazing</h1>
          <p className="text-gray-600">Mulai kolaborasi dengan mahasiswa se-Indonesia</p>
        </motion.div>

        {/* Alert Message */}
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg border ${
              alertType === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : alertType === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                alertType === "error" 
                  ? "text-red-500" 
                  : alertType === "success"
                  ? "text-green-500"
                  : "text-amber-500"
              }`} />
              <div>
                <p className="font-medium">
                  {alertType === "error" 
                    ? "Pendaftaran Gagal" 
                    : alertType === "success"
                    ? "Berhasil"
                    : "Perhatian"}
                </p>
                <p className="text-sm mt-1">{alertMessage}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Indicator (updated for 3 steps) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center justify-between mb-2 px-8 relative">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-gray-200 -translate-y-1/2">
              <div 
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] transition-all duration-500 ease-in-out"
                style={{ 
                  width: currentStep >= 2 ? (currentStep >= 3 ? '100%' : '50%') : '0%' 
                }}
              />
            </div>
            
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step <= currentStep
                    ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white"
                    : "bg-white border-2 border-gray-200 text-gray-500"
                }`}
              >
                {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-4">
            <span>Info</span>
            <span>OTP</span>
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
            <CardContent className="space-y-3">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  {/* Full Name */}
                  <div className="space-y-1">
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
                  <div className="space-y-1">
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
                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Contoh: +628112444123"
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
                  <div className="space-y-1">
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
                  <div className="space-y-1">
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

                  <Button 
                    onClick={handleNext} 
                    className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengirim OTP...</span>
                      </div>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </div>
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 2 && (
                <div className="space-y-3">
                  {/* OTP Code Input */}
                  <div className="space-y-1">
                    <label htmlFor="otpCode" className="text-sm font-medium text-gray-700">
                      Kode OTP
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="otpCode"
                        type="text"
                        placeholder="Masukkan 6 digit kode OTP"
                        value={formData.otpCode}
                        onChange={(e) => handleInputChange("otpCode", e.target.value)}
                        className={`pl-10 text-center text-lg tracking-widest ${errors.otpCode ? "border-red-500" : ""}`}
                        maxLength={6}
                      />
                    </div>
                    {errors.otpCode && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.otpCode}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 text-center">
                      Kode OTP telah dikirim ke <strong>{formData.email}</strong>
                    </p>
                    <div className="text-xs text-gray-500 text-center">
                      Tidak menerima kode?{" "}
                      {canResendOTP ? (
                        <button 
                          type="button" 
                          onClick={handleResendOTP}
                          disabled={isLoading}
                          className="text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Kirim ulang OTP
                        </button>
                      ) : (
                        <span className="text-gray-400">
                          Kirim ulang dalam {resendTimer} detik
                        </span>
                      )}
                      {" atau "}
                      <button 
                        type="button" 
                        onClick={() => {
                          setCurrentStep(1)
                          setResendTimer(0)
                          setCanResendOTP(false)
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        ubah email
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => {
                        setCurrentStep(1)
                        setResendTimer(0)
                        setCanResendOTP(false)
                      }}
                      className="flex-1"
                    >
                      Kembali
                    </Button>
                    <Button 
                      onClick={handleVerifyOTP} 
                      className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                    >
                      Lanjutkan
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Terms and Completion */}
              {currentStep === 3 && (
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
                      onClick={() => setCurrentStep(2)}
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
          className="text-center mt-4"
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
