"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Chrome,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"
import { login } from "@/lib/api/auth"
import { googleLogin } from "@/lib/api/SocialAuth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002'

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "warning" | "">("");

  // Check for login message from redirect
  useEffect(() => {
    const loginMessage = localStorage.getItem("loginMessage");
    if (loginMessage) {
      setAlertMessage(loginMessage);
      setAlertType("warning");
      // Clear the message after showing it
      localStorage.removeItem("loginMessage");
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");
    setAlertMessage("");
    setAlertType("");

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login successful:", response.message);

      // Store token and user data in localStorage
      localStorage.setItem("token", response.data?.token || "");
      localStorage.setItem("user", JSON.stringify(response.data?.user || {}));

      // Redirect to profile page or dashboard
      router.push("/profile");
    } catch (error: unknown) {
      // Handle different types of errors
      let errorType = "error";
      let displayMessage = "";

      if (error && typeof error === 'object') {
        // Network or connection error
        if ('type' in error && error.type === 'NETWORK_ERROR') {
          displayMessage = "Gagal terhubung ke server. Periksa koneksi internet Anda.";
          errorType = "error";
        }
        // API response error
        else if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
          const apiError = error.response.data as { message?: string; success?: boolean };
          const errorMessage = apiError?.message || "";
          
          // Handle error types without exposing backend messages
          if (errorMessage.includes("Invalid Credetial Email") || errorMessage.includes("Invalid Credential Email") || errorMessage.toLowerCase().includes("email")) {
            errorType = "warning";
            displayMessage = "Email tidak terdaftar. Silakan daftar terlebih dahulu atau periksa kembali email Anda.";
            setApiError("Email tidak terdaftar");
          } else if (errorMessage.includes("Invalid Credential Password") || errorMessage.toLowerCase().includes("password")) {
            errorType = "error";
            displayMessage = "Password yang Anda masukkan salah. Silakan periksa kembali password Anda.";
            setApiError("Password salah");
          } else {
            errorType = "error";
            displayMessage = "Login gagal. Silakan periksa kembali email dan password Anda.";
            setApiError("Login gagal");
          }
        }
        // Generic error with message
        else if ('message' in error && typeof error.message === 'string') {
          displayMessage = "Login gagal. Silakan coba lagi nanti.";
          errorType = "error";
        }
        // Unknown object error
        else {
          displayMessage = "Terjadi kesalahan tidak dikenal. Silakan coba lagi.";
          errorType = "error";
        }
      } else {
        // Primitive error or null/undefined
        displayMessage = "Terjadi kesalahan tidak dikenal. Silakan coba lagi.";
        errorType = "error";
      }

      setAlertType(errorType as "error" | "warning");
      setAlertMessage(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear API error on any input change
    if (apiError) {
      setApiError("");
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === "google") {
      setIsLoading(true);
      setApiError("");
      setAlertMessage("");
      setAlertType("");

      try {
        try {
          // Try to use the SocialAuth module to get the Google OAuth URL
          const response = await googleLogin();
          
          if (response && response.url) {
            // Redirect to the Google OAuth URL returned from the API
            window.location.href = response.url;
            return;
          }
        } catch (apiError) {
          // SocialAuth API failed, use fallback
        }
        
        // Fallback: redirect directly to backend endpoint
        window.location.href = `${API_BASE_URL}/api/auth/google/login`;

        // The backend will handle the entire OAuth flow and should redirect back
        // to your frontend with the auth data
      } catch (error: unknown) {
        let displayMessage = "Google login gagal. Silakan coba lagi.";
        
        // Handle structured errors from SocialAuth module
        if (error && typeof error === 'object' && 'response' in error) {
          const errorObj = error as { response?: { data?: { message?: string } } };
          const errorMessage = errorObj.response?.data?.message;
          
          if (errorMessage) {
            displayMessage = "Tidak dapat menghubungkan ke Google. Silakan coba lagi nanti.";
          }
        }
        
        setAlertType("error");
        setAlertMessage(displayMessage);
        setApiError("Google login gagal");
        setIsLoading(false);
      }
    } else {
      console.log(`Login with ${provider}`);
      // Handle other social login providers
    }
  };

  return (
    <div className="min-h-screen  from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat Datang di Synergazing
          </h1>
          <p className="text-gray-600">
            Masuk ke akun Anda untuk memulai kolaborasi
          </p>
        </motion.div>

        {/* Alert Message */}
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg border ${
              alertType === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertCircle
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  alertType === "error" ? "text-red-500" : "text-amber-500"
                }`}
              />
              <div>
                <p className="font-medium">
                  {alertType === "error" ? "Login Gagal" : "Perhatian"}
                </p>
                <p className="text-sm mt-1">{alertMessage}</p>
                {alertType === "warning" && (
                  <p className="text-sm mt-2">
                    Belum punya akun?{" "}
                    <Link
                      href="/register"
                      className="font-medium underline hover:no-underline"
                    >
                      Daftar di sini
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center">Masuk</CardTitle>
              <CardDescription className="text-center">
                Gunakan email dan password Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
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

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        handleInputChange("rememberMe", checked as boolean)
                      }
                    />
                    <label htmlFor="remember" className="text-sm text-gray-600">
                      Ingat saya
                    </label>
                  </div>
                  <Link
                    href="/forgotPassword"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Atau masuk dengan
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin("google")}
                  className="bg-transparent"
                >
                  <Chrome className="h-4 w-4 mr-2" />
                  Google
                </Button>
              </div>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Belum punya akun?{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Daftar sekarang
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
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke beranda</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
