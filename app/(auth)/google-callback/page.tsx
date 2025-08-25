"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if there are any error parameters from Google
        const error = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")

        if (error) {
          throw new Error(`OAuth error: ${error} - ${errorDescription || 'Unknown error'}`)
        }

        // Check for success parameters that might be passed from the backend
        const token = searchParams.get("token")
        const user = searchParams.get("user")
        const success = searchParams.get("success")

        if (success === "true" && token) {
          // Backend successfully processed the OAuth and redirected here with token
          localStorage.setItem("token", token)
          if (user) {
            localStorage.setItem("user", decodeURIComponent(user))
          }

          setStatus("success")
          setMessage("Login berhasil! Anda akan dialihkan...")

          // Redirect to profile page after a short delay
          setTimeout(() => {
            router.push("/profile")
          }, 2000)
        } else {
          // If we reach here without success parameters, the backend might not be 
          // configured to redirect back to this page with the auth data
          throw new Error("Login tidak berhasil diselesaikan")
        }
      } catch (error: unknown) {
        console.error("Google callback error:", error)
        setStatus("error")
        setMessage((error as Error).message || "Terjadi kesalahan saat login")

        // Redirect back to login page after showing error
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Memproses login Google...</h1>
            <p className="text-gray-600">Mohon tunggu sebentar</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Login Berhasil!</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-red-600 mx-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Login Gagal</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">Anda akan dialihkan kembali ke halaman login...</p>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h1 className="text-xl font-semibold text-gray-900">Loading...</h1>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}