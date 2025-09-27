"use client";

import type React from "react";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api/forgot-password";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");

  // Get token from URL params
  useEffect(() => {
    const tokenParam = searchParams?.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Token reset password tidak valid atau telah expired");
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Password dan konfirmasi password tidak sama";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token reset password tidak valid");
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await resetPassword(
        token,
        formData.password,
        formData.passwordConfirm
      );

      if (response.success) {
        setSuccess(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError("Terjadi kesalahan saat reset password. Silakan coba lagi.");
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);

      const errorObj = error as { response?: { data?: { message?: string } } };
      const backendMessage = errorObj?.response?.data?.message || "";

      // Handle specific error types without exposing exact backend messages
      if (backendMessage.toLowerCase().includes("token") || backendMessage.toLowerCase().includes("expired")) {
        setError("Token reset password tidak valid atau telah expired. Silakan minta link reset password baru.");
      } else if (backendMessage.toLowerCase().includes("password")) {
        setError("Password tidak memenuhi syarat. Pastikan password minimal 6 karakter dan konfirmasi password sama.");
      } else {
        setError("Terjadi kesalahan saat reset password. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear general error on any input change
    if (error) {
      setError("");
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Memvalidasi token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Masukkan password baru untuk akun Anda
          </p>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg border bg-green-50 border-green-200 text-green-800"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-500" />
              <div>
                <p className="font-medium">Password Berhasil Direset</p>
                <p className="text-sm mt-1">
                  Password Anda telah berhasil diperbarui. Anda akan dialihkan ke halaman login dalam beberapa detik.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg border bg-red-50 border-red-200 text-red-800"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-medium">Reset Password Gagal</p>
                <p className="text-sm mt-1">{error}</p>
                {error.includes("expired") && (
                  <p className="text-sm mt-2">
                    <Link
                      href="/forgotPassword"
                      className="font-medium underline hover:no-underline"
                    >
                      Minta link reset password baru
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reset Password Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center">Password Baru</CardTitle>
              <CardDescription className="text-center">
                Buat password yang kuat dan aman
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password Baru
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password baru"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                        disabled={isLoading}
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

                  {/* Password Confirmation Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="passwordConfirm"
                      className="text-sm font-medium text-gray-700"
                    >
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="passwordConfirm"
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder="Konfirmasi password baru"
                        value={formData.passwordConfirm}
                        onChange={(e) =>
                          handleInputChange("passwordConfirm", e.target.value)
                        }
                        className={`pl-10 pr-10 ${errors.passwordConfirm ? "border-red-500" : ""}`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswordConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.passwordConfirm && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.passwordConfirm}</span>
                      </div>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Password harus memenuhi syarat:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Minimal 6 karakter</li>
                      <li>Konfirmasi password harus sama</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading || !token}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              )}

              {success && (
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    Anda akan dialihkan ke halaman login secara otomatis...
                  </p>
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-blue-700 hover:to-purple-700"
                  >
                    Masuk Sekarang
                  </Button>
                </div>
              )}

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Sudah ingat password?{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:underline font-medium"
                  >
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}