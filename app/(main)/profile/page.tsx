"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Mail, Phone, MapPin, Briefcase, GraduationCap, LinkIcon, Edit, Users, MessageCircle, Plus, Eye, Download, FileText, Upload, File, Camera, Github, Linkedin, Instagram } from 'lucide-react'
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Mock data for projects (copied from app/recruiter-dashboard/page.tsx for consistency)
const allProjectsData = [
  {
    id: "1",
    title: "AI-Powered Content Generator",
    description: "Develop a web application that uses AI to generate engaging content for various platforms.",
    skills: ["Python", "TensorFlow", "React", "Next.js", "NLP"],
    teamSize: 5,
    duration: "3 months",
    location: "Remote",
    status: "In Progress", // Changed for demo
    recruiterId: 1, // Assuming user with id 1 (Adit Cukur) is the recruiter
    completion: 75,
    role: "Project Lead",
    technologies: ["React", "Node.js", "Arduino", "MongoDB"],
  },
  {
    id: "2",
    title: "E-commerce Platform Redesign",
    description: "Revamp an existing e-commerce website with a modern UI/UX and improved performance.",
    skills: ["React", "Node.js", "MongoDB", "UI/UX", "Figma"],
    teamSize: 4,
    duration: "2 months",
    location: "Hybrid (Jakarta)",
    status: "Completed",
    recruiterId: 1, // Assuming user with id 1 (Adit Cukur) is the recruiter
    completion: 100,
    role: "Full-Stack Developer",
    technologies: ["Vue.js", "Laravel", "MySQL"],
  },
  {
    id: "3",
    title: "Mobile Fitness Tracker App",
    description:
      "Build a cross-platform mobile application to track fitness activities and provide personalized workout plans.",
    skills: ["React Native", "Firebase", "TypeScript", "Health API"],
    teamSize: 3,
    duration: "4 months",
    location: "Remote",
    status: "Open",
    recruiterId: 2, // Another recruiter
    completion: 0,
    role: "Mobile Developer",
    technologies: ["React Native", "Firebase", "TensorFlow"],
  },
]

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
  // CV information
  cv: {
    fileName: "Adit_Cukur_CV_2025.pdf",
    uploadDate: "2025-06-15",
    url: "/sample-cv.pdf", // In a real app, this would be a URL to the stored PDF
  },
  // Stats
  stats: {
    projects: 12, // This will be dynamically calculated
    completedProjects: 8, // This will be dynamically calculated
  },
  // Skills with proficiency levels
  skills: [
    { name: "JavaScript", level: 90, category: "Programming" },
    { name: "React", level: 85, category: "Frontend" },
    { name: "Node.js", level: 80, category: "Backend" },
    { name: "Python", level: 75, category: "Programming" },
    { name: "IoT Development", level: 85, category: "Hardware" },
    { name: "Arduino", level: 80, category: "Hardware" },
    { name: "MongoDB", level: 70, category: "Database" },
    { name: "UI/UX Design", level: 65, category: "Design" },
    { name: "Machine Learning", level: 60, category: "AI/ML" },
    { name: "Docker", level: 70, category: "DevOps" },
  ],
  // Social links
  socialLinks: {
    github: "https://github.com/aditcukur",
    linkedin: "https://linkedin.com/in/aditcukur",
    instagram: "https://instagram.com/aditcukur",
    portfolio: "https://aditcukur.dev",
  },
  isReadyForCollaboration: true,
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false)
  const [skillToEdit, setSkillToEdit] = useState<{ name: string; level: number; category: string } | null>(null)
  const [newSkill, setNewSkill] = useState({ name: "", level: 75, category: "" })
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

  // Filter projects created by this user
  const userProjects = allProjectsData.filter((project) => project.recruiterId === userData.id)
  const completedUserProjects = userProjects.filter((project) => project.status === "Completed").length

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, this would upload the file to a server
      setIsUploading(true)
      // Simulate upload delay
      setTimeout(() => {
        setIsUploading(false)
        // Update CV data (in a real app, this would come from the server response)
        // This is just mocking the update
      }, 1500)
    }
  }

  const handleSaveChanges = () => {
    // In a real app, this would make an API call to update the user data
    console.log("Saving changes:", editData)
    setIsEditing(false)
    // You would update the userData here with the new values
  }

  const handleAddSkill = () => {
    // In a real app, this would make an API call to add the skill
    console.log("Adding skill:", newSkill);
    // Reset form
    setNewSkill({ name: "", level: 75, category: "" });
    setIsSkillDialogOpen(false);
    // In a real app, you would update the userData.skills array
  }

  const handleEditSkill = (skill: { name: string; level: number; category: string }) => {
    setSkillToEdit(skill);
    setNewSkill({ ...skill });
    setIsSkillDialogOpen(true);
  }

  const handleUpdateSkill = () => {
    // In a real app, this would make an API call to update the skill
    console.log("Updating skill:", newSkill);
    setSkillToEdit(null);
    setNewSkill({ name: "", level: 75, category: "" });
    setIsSkillDialogOpen(false);
    // In a real app, you would update the userData.skills array
  }

  const handleDeleteSkill = (skillName: string) => {
    // In a real app, this would make an API call to delete the skill
    console.log("Deleting skill:", skillName);
    // In a real app, you would update the userData.skills array
  }
  
  const skillCategories = [
    "All",
    "Programming",
    "Frontend",
    "Backend",
    "Hardware",
    "Database",
    "Design",
    "AI/ML",
    "DevOps",
  ]

  const [selectedSkillCategory, setSelectedSkillCategory] = useState("All")
  const filteredSkills =
    selectedSkillCategory === "All"
      ? userData.skills
      : userData.skills.filter((skill) => skill.category === selectedSkillCategory)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar Section */}
                  <div className="relative flex-shrink-0">
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

                  {/* Info Section */}
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl font-bold">{userData.name}</h1>
                    <p className="text-muted-foreground">{editData.title}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4" />
                        <span>{editData.university} • {editData.major}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{editData.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Button Section */}
                  <div className="w-full sm:w-auto">
                    <Link href="/profile/edit">
                      <Button className="w-full sm:w-auto">
                        <Edit className="h-4 w-4 mr-2" /> Edit Profil
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Ready to Synergize Toggle */}
                <div className="flex items-center justify-between p-3 mt-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">Siap untuk Kolaborasi (#ReadyToSynergize)</h4>
                    <p className="text-xs text-gray-500">
                      Tampilkan profil Anda apakah bersedia menjadi kolaborator.
                    </p>
                  </div>
                  <Switch
                    checked={editData.isReadyForCollaboration}
                    onCheckedChange={(checked) => setEditData({ ...editData, isReadyForCollaboration: checked })}
                  />
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{userProjects.length}</p>
                    <p className="text-sm text-muted-foreground">Proyek Dibuat</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{completedUserProjects}</p>
                    <p className="text-sm text-muted-foreground">Proyek Selesai</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Proyek</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tentang Saya</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{editData.bio}</p>
                  </CardContent>
                </Card>

                {/* Experience */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pengalaman Kolaborasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Using mock experience data from previous context */}
                      {[
                        {
                          title: "Lead Developer",
                          project: "Smart Campus IoT System",
                          period: "Jan 2024 - Present",
                          description:
                            "Leading a team of 5 developers to create an IoT monitoring system for campus facilities.",
                          skills: ["Leadership", "IoT", "React", "Node.js"],
                        },
                        {
                          title: "Frontend Developer",
                          project: "Student Portal Redesign",
                          period: "Sep 2023 - Dec 2023",
                          description: "Redesigned and developed the university student portal with modern UI/UX.",
                          skills: ["React", "UI/UX", "TypeScript"],
                        },
                      ].map((exp, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{exp.title}</h4>
                            <p className="text-blue-600 font-medium">{exp.project}</p>
                            <p className="text-sm text-gray-500 mb-2">{exp.period}</p>
                            <p className="text-gray-700 mb-3">{exp.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {exp.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Skills & Keahlian</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSkillToEdit(null);
                        setNewSkill({ name: "", level: 75, category: "" });
                        setIsSkillDialogOpen(true);
                      }}
                      className="h-8 px-2 lg:px-3"
                    >
                      <Plus className="h-4 w-4 mr-0 lg:mr-2" />
                      <span className="hidden lg:inline">Tambah Skill</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {/* Skill Categories */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skillCategories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedSkillCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSkillCategory(category)}
                          className={selectedSkillCategory !== category ? "bg-transparent" : ""}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>

                    {/* Skills as badges with edit option */}
                    <div className="flex flex-wrap gap-2">
                      {filteredSkills.length === 0 ? (
                        <p className="text-gray-500 text-sm py-2">
                          Tidak ada skill yang ditampilkan untuk kategori ini.
                        </p>
                      ) : (
                        filteredSkills.map((skill) => (
                          <div key={skill.name} className="relative group">
                            <Badge 
                              variant="secondary" 
                              className="p-2"
                            >
                              {skill.name}
                              <button 
                                onClick={() => handleEditSkill(skill)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                              </button>
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Other cards in overview tab... */}
                
                {/* Skill Add/Edit Dialog */}
                <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{skillToEdit ? 'Edit Skill' : 'Tambah Skill Baru'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nama Skill</label>
                        <Input 
                          value={newSkill.name} 
                          onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                          placeholder="contoh: React, Python, UI/UX Design"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Kategori</label>
                        <Input 
                          value={newSkill.category} 
                          onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
                          placeholder="contoh: Programming, Frontend, Database"
                        />
                        <p className="text-xs text-gray-500">
                          Pilih kategori yang sesuai untuk mengelompokkan skill Anda
                        </p>
                      </div>
                      
                    </div>
                    <DialogFooter className="flex gap-2 sm:justify-between">
                      {skillToEdit && (
                        <Button 
                          variant="destructive" 
                          type="button"
                          onClick={() => {
                            handleDeleteSkill(skillToEdit.name);
                            setIsSkillDialogOpen(false);
                          }}
                        >
                          Hapus
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsSkillDialogOpen(false)}
                        >
                          Batal
                        </Button>
                        <Button 
                          type="button"
                          onClick={skillToEdit ? handleUpdateSkill : handleAddSkill}
                        >
                          {skillToEdit ? 'Simpan Perubahan' : 'Tambah Skill'}
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Proyek Saya ({userProjects.length})</h2>
                  <Link href="/create-project">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Buat Proyek Baru
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProjects.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-10">
                      Anda belum membuat proyek apa pun.
                    </div>
                  ) : (
                    userProjects.map((project) => (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={project.image || "/placeholder.svg?height=200&width=300&text=Project"}
                            alt={project.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <Badge
                            className={`absolute top-3 left-3 ${
                              project.status === "Completed" ? "bg-green-500" : "bg-blue-500"
                            }`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                              Role: <span className="font-medium">{project.role}</span>
                            </span>
                            <span>{project.teamSize} anggota tim</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {project.skills.map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/projects/${project.id}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full bg-transparent">
                                <Eye className="h-4 w-4 mr-2" /> Lihat Detail
                              </Button>
                            </Link>
                            <Link href={`/recruiter-dashboard?projectId=${project.id}`} className="flex-1">
                              <Button size="sm" className="w-full">
                                <Users className="h-4 w-4 mr-2" /> Lihat Pelamar
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{editData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Telepon</p>
                    <p className="text-sm text-gray-600">{editData.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Media Sosial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={editData.socialLinks.github}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="text-sm">GitHub</span>
                  <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                </a>
                <a
                  href={editData.socialLinks.linkedin}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">LinkedIn</span>
                  <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                </a>
                <a
                  href={editData.socialLinks.instagram}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <span className="text-sm">Instagram</span>
                  <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                </a>
                <a
                  href={editData.socialLinks.portfolio}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LinkIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Portfolio</span>
                  <LinkIcon className="h-4 w-4 ml-auto text-gray-400" />
                </a>
              </CardContent>
            </Card>

            {/* CV Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>CV / Resume</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-8 h-8 border-2 border-t-blue-600 border-blue-200 rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-gray-500">Mengupload CV...</p>
                  </div>
                ) : userData.cv ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{userData.cv.fileName}</p>
                        <p className="text-xs text-gray-500">
                          Diupload pada {userData.cv.uploadDate} • {userData.cv.fileSize}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center justify-center bg-transparent"
                        onClick={() => setIsPdfViewerOpen(true)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Lihat
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center justify-center bg-transparent">
                        <Download className="h-4 w-4 mr-2" /> Unduh
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <File className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">Upload CV Anda untuk meningkatkan peluang kolaborasi</p>
                    <label
                      htmlFor="cv-upload-alt"
                      className="inline-flex items-center justify-center text-sm font-medium rounded-md px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload CV
                    </label>
                    <input id="cv-upload-alt" type="file" accept=".pdf" className="hidden" onChange={handleCvUpload} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <DialogTitle className="text-xl font-semibold mb-6">Edit Profil</DialogTitle>
            <div className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Dasar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Judul Profil</label>
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="e.g. Full-Stack Developer & IoT Enthusiast"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Lokasi</label>
                    <Input
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      placeholder="e.g. Bandung, Indonesia"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Universitas</label>
                  <Input
                    value={editData.university}
                    onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                    placeholder="e.g. Universitas Dian Nuswantoro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Jurusan</label>
                  <Input
                    value={editData.major}
                    onChange={(e) => setEditData({ ...editData, major: e.target.value })}
                    placeholder="e.g. Teknik Informatika"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tentang Saya</label>
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Ceritakan tentang diri Anda..."
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="space-y-4">
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

              {/* Social Media Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Media Sosial</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveChanges} className="flex-1">
                  Simpan Perubahan
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent">
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={isPdfViewerOpen} onOpenChange={setIsPdfViewerOpen}>
        <DialogContent className="max-w-5xl">
          <div className="p-4">
            <DialogTitle className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span>CV Preview: {userData.cv?.fileName}</span>
              <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setIsPdfViewerOpen(false)}>
                Close
              </Button>
            </DialogTitle>
            <div className="bg-gray-100 rounded-lg p-2 border border-gray-200">
              <div className="w-full h-[70vh] overflow-hidden">
                <iframe src={userData.cv?.url + "#toolbar=1"} className="w-full h-full border-0" title="CV Preview" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button size="sm" variant="outline" className="flex items-center justify-center bg-transparent mr-2">
                <Download className="h-4 w-4 mr-2" /> Unduh CV
              </Button>
              <Button size="sm" onClick={() => setIsPdfViewerOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
