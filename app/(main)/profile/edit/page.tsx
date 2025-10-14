"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Github, Linkedin, Instagram, LinkIcon, ArrowLeft, Upload, Camera } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { User } from "@/types"
import { getProfile } from "@/lib/api/profile-management"
import { updateProfile } from "@/lib/api/profile-management"

export default function EditProfilePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    about_me: "",
    location: "",
    interests: "",
    academic: "",
    website_url: "",
    github_url: "",
    linkedin_url: "",
    instagram_url: "",
    portfolio_url: "",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getProfile(token).then(response => {
        const userData = response.data;
        const profileData = userData.profile || {};
        
        setUserData(userData);
        
        // Set edit data with proper fallbacks to avoid undefined values
        setEditData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          about_me: profileData.about_me || "",
          location: profileData.location || "",
          interests: profileData.interests || "",
          academic: profileData.academic || "",
          website_url: profileData.website_url || "",
          github_url: profileData.github_url || "",
          linkedin_url: profileData.linkedin_url || "",
          instagram_url: profileData.instagram_url || "",
          portfolio_url: profileData.portfolio_url || "",
        });
      }).catch(err => console.error(err));
    }
  }, []);

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    Object.entries(editData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }
    if (cvFile) {
      formData.append('cv_file', cvFile);
    }
    
    try {
      const response = await updateProfile(token, formData);
      
      // Update localStorage with the new user data
      if (response && response.data) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          // Update with all the returned data from the API
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          profile_picture: response.data.profile_picture, // This is the key field for navbar
          cv_file: response.data.cv_file,
          profile: response.data.profile,
        };
        
        console.log('Updating localStorage with:', updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Dispatch event to notify other components (like navbar) about the profile update
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: { user: updatedUser } 
        }));
        
        console.log('Profile update event dispatched');
      }
      
      router.push('/profile');
    } catch (error) {
      console.error(error);
    }
  };

  if (!userData) {
    return <div>Loading...</div>
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
                    {(profilePicture || userData.profile_picture) ? (
                      <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-background shadow-md bg-gray-100">
                        <img 
                          src={profilePicture ? URL.createObjectURL(profilePicture) : userData.profile_picture} 
                          alt={editData.name || "Profile Picture"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-full border-4 border-background shadow-md bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-gray-500">
                          {editData.name
                            ? editData.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "U"}
                        </span>
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      onClick={() => document.getElementById('profile-picture-upload')?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input 
                      type="file" 
                      id="profile-picture-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => setProfilePicture(e.target.files?.[0] || null)} 
                    />
                  </div>
                  
                  <h2 className="text-xl font-bold">{editData.name}</h2>
                </div>
              </div>
            </Card>

            {/* Basic Info Section */}
            <Card>
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-medium">Informasi Dasar</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="e.g. Adit Cukur"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Main Role</label>
                    <Input
                      value={editData.interests}
                      onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
                      placeholder="e.g. IoT, Web Development, Gaming"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Akademik</label>
                      <Input
                        value={editData.academic}
                        onChange={(e) => setEditData({ ...editData, academic: e.target.value })}
                        placeholder="e.g. Teknik Informatika, Universitas Dian Nuswantoro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Lokasi</label>
                      <Input
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        placeholder="e.g. Pati, Indonesia"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Tentang Saya</label>
                    <Textarea
                      value={editData.about_me}
                      onChange={(e) => setEditData({ ...editData, about_me: e.target.value })}
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
                <h3 className="text-lg font-medium">Media Sosial & Tautan</h3>
                
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                      <LinkIcon className="inline h-4 w-4 mr-1 text-green-600" />
                      Website
                    </label>
                    <Input
                      value={editData.website_url}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          website_url: e.target.value,
                        })
                      }
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Github className="inline h-4 w-4 mr-1" />
                      GitHub
                    </label>
                    <Input
                      value={editData.github_url}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          github_url: e.target.value,
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
                      value={editData.linkedin_url}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          linkedin_url: e.target.value,
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
                      value={editData.instagram_url}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          instagram_url: e.target.value,
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
                      value={editData.portfolio_url}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          portfolio_url: e.target.value,
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
                    <p className="text-sm text-gray-600 mb-2 max-w-full">
                      {cvFile ? (
                        <span className="block truncate px-2" title={cvFile.name}>
                          {cvFile.name}
                        </span>
                      ) : (
                        "Drag & drop CV Anda di sini, atau"
                      )}
                    </p>
                    <Button size="sm" onClick={() => document.getElementById('cv-upload')?.click()}>
                      <Upload className="h-3.5 w-3.5 mr-1.5" /> Pilih File
                    </Button>
                    <input type="file" id="cv-upload" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
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