"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("🔄 AuthCallback useEffect triggered");
    console.log("Current URL:", window.location.href);

    // Get all URL parameters
    const params = new URLSearchParams(searchParams.toString());
    console.log("Search params:", searchParams.toString());
    console.log("Params object:", Object.fromEntries(params));

    // Check if we have the success parameters
    const success = searchParams.get("success");
    const token = searchParams.get("token");
    const userId = searchParams.get("user_id");
    const userName = searchParams.get("user_name");
    const userEmail = searchParams.get("user_email");

    if (success === "true" && token) {
      console.log("✅ Success parameters found, processing directly...");

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Create and store user object from URL parameters
      if (userId && userName && userEmail) {
        const userData = {
          id: parseInt(userId),
          name: decodeURIComponent(userName.replace(/\+/g, " ")),
          email: decodeURIComponent(userEmail),
        };
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ User data stored:", userData);
      }

      console.log("🔄 Redirecting to profile page...");

      // Redirect directly to profile
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } else {
      // If no success parameters, redirect to Google callback handler
      const redirectUrl = `/auth/google-callback?${params.toString()}`;
      console.log("🎯 Redirecting to google callback handler:", redirectUrl);

      setTimeout(() => {
        router.replace(redirectUrl);
      }, 100);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <h1 className="text-xl font-semibold text-gray-900">
          Memproses login...
        </h1>
        <p className="text-gray-600">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Loading...</h1>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
