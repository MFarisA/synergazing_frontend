"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Github, Linkedin, Instagram, LinkIcon, ArrowLeft, Upload, Camera } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

// Mock user data - in real app, this would come from API/auth
const userData = {
  id: 1, // This user's ID
  name: "Adit Cukur",
  username: "aditcukur",
  avatar: "https://mahasiswa.dinus.ac.id/images/foto/A/A11/2022/A11.2022.14148.jpg",
  title: "Full-Stack Developer & IoT Enthusiast",
  university: "Universitas Dian Nuswantoro",
  major: "Teknik Informatika",
  year: "Semester 7",
  location: "Pati, Indonesia",
  bio: "Passionate about creating innovative solutions through technology. Experienced in full-stack development with a focus on IoT systems and real-time applications. Always eager to collaborate on meaningful projects that make a difference.",
  email: "adittukangcukur@mail.com",
  phone: "+62 812-3456-7890",
  // Social links
  socialLinks: {
    github: "https://github.com/aditcukur",
    linkedin: "https://linkedin.com/in/aditcukur",
    instagram: "https://instagram.com/aditcukur",
    portfolio: "https://aditcukur.dev",
  },
  isReadyForCollaboration: true,
}

export default function EditProfilePage() {
  const router = useRouter()
  const [editData, setEditData] = useState({
    bio: userData.bio,
    title: userData.title,
    location: userData.location,
    university: userData.university,
    major: userData.major,
    year: userData.year,
    email: userData.email,
    phone: userData.phone,
    socialLinks: {
      github: userData.socialLinks.github,
      linkedin: userData.socialLinks.linkedin,
      instagram: userData.socialLinks.instagram,
      portfolio: userData.socialLinks.portfolio,
    },
    isReadyForCollaboration: userData.isReadyForCollaboration,
  })

  const handleSaveChanges = () => {
    // In a real app, this would make an API call to update the user data
    console.log("Saving changes:", editData)
    
    // Navigate back to profile page
    router.push('/profile')
  }

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Profil</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Avatar */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                      <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-2xl">
                        {userData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h2 className="text-xl font-bold">{userData.name}</h2>
                </div>
              </div>
            </Card>

            {/* Basic Info Section */}
            <Card>
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-medium">Informasi Dasar</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Judul Profil</label>
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="contoh: Full-Stack Developer & IoT Enthusiast"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Universitas</label>
                      <Input
                        value={editData.university}
                        onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                        placeholder="contoh: Universitas Dian Nuswantoro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Jurusan</label>
                      <Input
                        value={editData.major}
                        onChange={(e) => setEditData({ ...editData, major: e.target.value })}
                        placeholder="contoh: Teknik Informatika"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Lokasi</label>
                    <Input
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      placeholder="contoh: Bandung, Indonesia"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Tentang Saya</label>
                    <Textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      placeholder="Ceritakan tentang diri Anda..."
                      className="min-h-[150px] resize-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Info Section */}
            <Card>
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-medium">Informasi Kontak</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nomor Telepon</label>
                    <Input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="+62 812-3456-7890"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Social Media Section */}
            <Card>
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-medium">Media Sosial</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Github className="inline h-4 w-4 mr-1" />
                      GitHub
                    </label>
                    <Input
                      value={editData.socialLinks.github}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          socialLinks: { ...editData.socialLinks, github: e.target.value },
                        })
                      }
                      placeholder="https://github.com/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Linkedin className="inline h-4 w-4 mr-1 text-blue-600" />
                      LinkedIn
                    </label>
                    <Input
                      value={editData.socialLinks.linkedin}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          socialLinks: { ...editData.socialLinks, linkedin: e.target.value },
                        })
                      }
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Instagram className="inline h-4 w-4 mr-1 text-pink-600" />
                      Instagram
                    </label>
                    <Input
                      value={editData.socialLinks.instagram}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          socialLinks: { ...editData.socialLinks, instagram: e.target.value },
                        })
                      }
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <LinkIcon className="inline h-4 w-4 mr-1 text-green-600" />
                      Portfolio
                    </label>
                    <Input
                      value={editData.socialLinks.portfolio}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          socialLinks: { ...editData.socialLinks, portfolio: e.target.value },
                        })
                      }
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CV Upload Section */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">CV / Resume</h3>
                
                <div className="rounded-lg border border-dashed border-gray-300">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop CV Anda di sini, atau
                    </p>
                    <Button size="sm" variant="primary">
                      <Upload className="h-3.5 w-3.5 mr-1.5" /> Pilih File
                    </Button>
                    <p className="text-xs text-gray-500 mt-3">
                      Format yang diperbolehkan: PDF. Maksimum 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={handleSaveChanges} className="w-full">
                Simpan Perubahan
              </Button>
              <Link href="/profile" className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Batal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}