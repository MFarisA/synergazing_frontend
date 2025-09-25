"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Metadata for deployment compatibility
// Force redeploy - Updated: 2024-12-25
// Note: metadata removed from client component

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processCallback = () => {
      console.log("🔄 Processing OAuth callback...");
      console.log("Current URL:", window.location.href);
      console.log("Search params:", searchParams.toString());

      try {
        // Extract all parameters from URL
        const success = searchParams.get("success");
        const token = searchParams.get("token");
        const userId = searchParams.get("user_id");
        const userName = searchParams.get("user_name");
        const userEmail = searchParams.get("user_email");
        const error = searchParams.get("error");

        console.log("📋 Extracted parameters:");
        console.log("- success:", success);
        console.log("- token:", token ? "present" : "missing");
        console.log("- userId:", userId);
        console.log("- userName:", userName);
        console.log("- userEmail:", userEmail);
        console.log("- error:", error);

        // Handle error case
        if (error) {
          console.error("❌ OAuth error:", error);
          alert(`Authentication failed: ${error}`);
          router.push("/login");
          return;
        }

        // Handle success case
        if (success === "true" && token) {
          console.log("✅ OAuth success - storing credentials...");

          // Store token
          localStorage.setItem("token", token);
          console.log("📝 Token stored");

          // Store user data if available
          if (userId && userName && userEmail) {
            const userData = {
              id: parseInt(userId),
              name: decodeURIComponent(userName.replace(/\+/g, " ")),
              email: decodeURIComponent(userEmail),
            };
            localStorage.setItem("user", JSON.stringify(userData));
            console.log("👤 User data stored:", userData);
          }

          // Set a flag to indicate successful login
          localStorage.setItem("login_success", "true");

          // Redirect to profile
          console.log("🚀 Redirecting to profile...");
          window.location.href = "/profile";
          return;
        }

        // If we get here, something went wrong
        console.warn("⚠️ Unexpected callback state - redirecting to login");
        router.push("/login");
      } catch (err) {
        console.error("💥 Error processing callback:", err);
        alert("An error occurred during authentication. Please try again.");
        router.push("/login");
      }
    };

    // Process callback after a short delay to ensure everything is loaded
    const timer = setTimeout(processCallback, 500);
    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            Processing Login...
          </h1>
          <p className="text-gray-600">
            Please wait while we complete your authentication
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">
            If this takes longer than expected, you will be redirected
            automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                Loading...
              </h1>
              <p className="text-gray-600">
                Please wait while we load the authentication handler
              </p>
            </div>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
