"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, User, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ProfileCompletionBannerProps {
  userData: any
  onDismiss?: () => void
}

export function ProfileCompletionBanner({ userData, onDismiss }: ProfileCompletionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  // Check if profile is incomplete
  const isProfileIncomplete = userData && (
    !userData.about_me ||
    !userData.location ||
    !userData.interests ||
    !userData.academic ||
    userData.about_me === "" ||
    userData.location === "" ||
    userData.interests === "" ||
    userData.academic === ""
  )

  // Check if this was dismissed before
  useEffect(() => {
    const dismissed = localStorage.getItem('profile-completion-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('profile-completion-dismissed', 'true')
    onDismiss?.()
  }

  // Don't show if profile is complete or dismissed
  if (!isProfileIncomplete || isDismissed) {
    return null
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 mb-1">
              Lengkapi Profil Anda
            </h3>
            <p className="text-sm text-orange-800 mb-3">
              Profil Anda belum lengkap. Lengkapi informasi seperti "Tentang Saya", "Lokasi", "Main Role", dan "Akademik" untuk dapat mengakses fitur kolaborator dan meningkatkan peluang kolaborasi.
            </p>
            <div className="flex gap-2">
              <Link href="/profile/edit">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                  <User className="h-4 w-4 mr-1" />
                  Lengkapi Profil
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDismiss}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Nanti Saja
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 h-8 w-8 p-0 text-orange-600 hover:bg-orange-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}