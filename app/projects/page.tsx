"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Zap,
  Send,
  Star,
  Clock,
  TrendingUp,
  Eye,
  Grid3X3,
  List,
} from "lucide-react"
import Link from "next/link"

const projects = [
  {
    id: 1,
    title: "Aplikasi Smart Campus IoT",
    description:
      "Mengembangkan sistem IoT untuk monitoring fasilitas kampus dengan dashboard real-time dan notifikasi otomatis untuk maintenance",
    recruiter: {
      name: "Ahmad Maulana",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Teknik Informatika",
      university: "ITB",
      rating: 4.8,
      projects: 12,
      connections: 150,
    },
    skills: ["React", "IoT", "Python", "Arduino", "Node.js"],
    duration: "3 bulan",
    members: "2/5",
    type: "Tugas Akhir",
    location: "Bandung",
    posted: "2 hari yang lalu",
    image: "/placeholder.svg?height=200&width=300&text=IoT+Campus",
    urgent: true,
    views: 45,
    applicants: 8,
    deadline: "15 Feb 2024",
  },
  {
    id: 2,
    title: "Kampanye Sosial Lingkungan",
    description:
      "Merancang kampanye kreatif untuk meningkatkan kesadaran lingkungan di kalangan mahasiswa dengan pendekatan multimedia dan storytelling",
    recruiter: {
      name: "Sari Rahayu",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Desain Komunikasi Visual",
      university: "UNPAD",
      rating: 4.9,
      projects: 8,
      connections: 200,
    },
    skills: ["Design", "Marketing", "Video Editing", "Social Media", "Adobe Creative"],
    duration: "2 bulan",
    members: "4/6",
    type: "Lomba",
    location: "Bandung",
    posted: "1 hari yang lalu",
    image: "/placeholder.svg?height=200&width=300&text=Green+Campaign",
    views: 67,
    applicants: 12,
    deadline: "20 Feb 2024",
  },
  {
    id: 3,
    title: "Riset AI untuk Kesehatan",
    description:
      "Penelitian pengembangan model AI untuk diagnosis dini penyakit berbasis data medis menggunakan deep learning dan computer vision",
    recruiter: {
      name: "Dr. Pratama",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Dosen Peneliti",
      university: "UI",
      rating: 5.0,
      projects: 25,
      connections: 500,
    },
    skills: ["Machine Learning", "Python", "TensorFlow", "Research", "Data Science"],
    duration: "6 bulan",
    members: "1/3",
    type: "Riset Dosen",
    location: "Jakarta",
    posted: "3 hari yang lalu",
    image: "/placeholder.svg?height=200&width=300&text=AI+Health",
    views: 89,
    applicants: 15,
    deadline: "28 Feb 2024",
  },
  {
    id: 4,
    title: "E-commerce Platform UMKM",
    description:
      "Membangun platform e-commerce khusus untuk UMKM dengan fitur inventory management, payment gateway, dan analytics dashboard",
    recruiter: {
      name: "Budi Santoso",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Sistem Informasi",
      university: "UGM",
      rating: 4.7,
      projects: 15,
      connections: 180,
    },
    skills: ["Laravel", "Vue.js", "MySQL", "Payment Gateway", "AWS"],
    duration: "4 bulan",
    members: "3/5",
    type: "Startup",
    location: "Yogyakarta",
    posted: "1 minggu yang lalu",
    image: "/placeholder.svg?height=200&width=300&text=UMKM+Platform",
    views: 123,
    urgent: true,
    applicants: 20,
    deadline: "10 Mar 2024",
  },
  {
    id: 5,
    title: "Game Edukasi Matematika",
    description:
      "Mengembangkan game mobile edukatif untuk pembelajaran matematika tingkat SD dengan gamifikasi yang menarik dan sistem reward",
    recruiter: {
      name: "Lisa Permata",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Teknik Informatika",
      university: "ITS",
      rating: 4.6,
      projects: 10,
      connections: 120,
    },
    skills: ["Unity", "C#", "Game Design", "UI/UX", "Mobile Dev"],
    duration: "5 bulan",
    members: "2/4",
    type: "Tugas Akhir",
    location: "Surabaya",
    posted: "4 hari yang lalu",
    image: "/placeholder.svg?height=200&width=300&text=Math+Game",
    views: 78,
    applicants: 11,
    deadline: "25 Feb 2024",
  },
  {
    id: 6,
    title: "Sistem Manajemen Perpustakaan",
    description:
      "Digitalisasi sistem perpustakaan dengan fitur peminjaman online, katalog digital, notifikasi otomatis, dan integrasi RFID",
    recruiter: {
      name: "Andi Wijaya",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Teknik Komputer",
      university: "UNHAS",
      rating: 4.5,
      projects: 7,
      connections: 95,
    },
    skills: ["PHP", "CodeIgniter", "MySQL", "Bootstrap", "RFID"],
    duration: "3 bulan",
    members: "1/4",
    type: "Kuliah",
    location: "Makassar",
    posted: "5 hari yang lalu",
    image: "/placeholder.svg?height=200&width=300&text=Library+System",
    views: 56,
    applicants: 9,
    deadline: "18 Feb 2024",
  },
]

const skillOptions = [
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "PHP",
  "Laravel",
  "Design",
  "UI/UX",
  "Figma",
  "Adobe Creative",
  "Video Editing",
  "Marketing",
  "Machine Learning",
  "Data Science",
  "IoT",
  "Mobile Dev",
  "Unity",
  "Game Design",
]

const locationOptions = ["Jakarta", "Bandung", "Yogyakarta", "Surabaya", "Makassar", "Medan", "Semarang"]

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(true)
  const [chatMessage, setChatMessage] = useState("")
  const [applicationData, setApplicationData] = useState({
    motivation: "",
    skills: "",
    contribution: "",
  })

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = selectedType === "all" || project.type === selectedType
    const matchesLocation = selectedLocation === "all" || project.location === selectedLocation
    const matchesSkills = selectedSkills.length === 0 || selectedSkills.some((skill) => project.skills.includes(skill))

    return matchesSearch && matchesType && matchesLocation && matchesSkills
  })

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      console.log("Sending message:", chatMessage)
      setChatMessage("")
    }
  }

  const handleSendApplication = () => {
    console.log("Sending application:", applicationData)
    setApplicationData({ motivation: "", skills: "", contribution: "" })
  }

  const setQuickMessage = (message: string) => {
    setChatMessage(message)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          

          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Cari proyek, skill, atau kata kunci..."
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px] h-12">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="Tugas Akhir">Tugas Akhir</SelectItem>
                  <SelectItem value="Lomba">Lomba</SelectItem>
                  <SelectItem value="Riset Dosen">Riset Dosen</SelectItem>
                  <SelectItem value="Startup">Startup</SelectItem>
                  <SelectItem value="Kuliah">Kuliah</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[140px] h-12">
                  <SelectValue placeholder="Semua Lokasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Lokasi</SelectItem>
                  {locationOptions.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="w-80 space-y-6">
              {/* Skills Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Filter berdasarkan Skill</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {skillOptions.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <label
                          htmlFor={skill}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedSkills.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setSelectedSkills([])} className="w-full mt-3">
                      Clear All
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Statistik Platform</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Proyek</span>
                    <span className="font-semibold">500+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Proyek Aktif</span>
                    <span className="font-semibold">342</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mahasiswa Terdaftar</span>
                    <span className="font-semibold">1,200+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Proyek Selesai</span>
                    <span className="font-semibold">158</span>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Skills */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Skill Trending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["React", "Python", "UI/UX", "Machine Learning", "Mobile Dev"].map((skill) => (
                      <Badge key={skill} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">{filteredProjects.length} Proyek Ditemukan</h2>
                {(searchQuery || selectedType !== "all" || selectedLocation !== "all" || selectedSkills.length > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedType("all")
                      setSelectedLocation("all")
                      setSelectedSkills([])
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="popular">Terpopuler</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Projects Grid/List */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-4"}>
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-all duration-200 group">
                  <div className="relative">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {project.urgent && <Badge className="absolute top-3 left-3 bg-red-500">Urgent</Badge>}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{project.type}</Badge>
                      <span className="text-sm text-gray-500">{project.posted}</span>
                    </div>
                    <CardTitle className="text-lg hover:text-blue-600 cursor-pointer">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    {/* Recruiter Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={project.recruiter.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {project.recruiter.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{project.recruiter.name}</p>
                        <p className="text-sm text-gray-600">{project.recruiter.major}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{project.recruiter.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{project.recruiter.projects} proyek</span>
                          <span>•</span>
                          <span>{project.recruiter.connections} koneksi</span>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {project.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {project.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.skills.length - 4}
                        </Badge>
                      )}
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{project.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{project.members}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{project.deadline}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{project.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{project.applicants} pelamar</span>
                        </div>
                      </div>
                                          </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {/* Chat Modal */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md p-0">
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <DialogTitle className="text-lg font-semibold">Chat dengan Recruiter</DialogTitle>
                                <DialogDescription className="text-sm text-gray-500">
                                  Tanyakan detail proyek kepada {project.recruiter.name}
                                </DialogDescription>
                              </div>
                            </div>

                            {/* Recruiter Profile */}
                            <div className="flex items-center gap-3 mb-6">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={project.recruiter.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {project.recruiter.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{project.recruiter.name}</p>
                                <p className="text-sm text-gray-600">
                                  {project.recruiter.major} - {project.recruiter.university}
                                </p>
                              </div>
                            </div>

                            {/* Quick Questions */}
                            <div className="mb-6">
                              <p className="font-medium mb-3">Pertanyaan Cepat:</p>
                              <div className="space-y-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left h-auto p-3 bg-transparent text-sm"
                                  onClick={() => setQuickMessage("Bisa dijelaskan lebih detail tentang proyek ini?")}
                                >
                                  Bisa dijelaskan lebih detail tentang proyek ini?
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left h-auto p-3 bg-transparent text-sm"
                                  onClick={() => setQuickMessage("Skill apa yang paling dibutuhkan?")}
                                >
                                  Skill apa yang paling dibutuhkan?
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left h-auto p-3 bg-transparent text-sm"
                                  onClick={() => setQuickMessage("Bagaimana timeline dan sistem kerjanya?")}
                                >
                                  Bagaimana timeline dan sistem kerjanya?
                                </Button>
                              </div>
                            </div>

                            {/* Message Input */}
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Tulis pesan Anda..."
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                className="min-h-[80px] resize-none"
                              />
                              <Button
                                onClick={handleSendMessage}
                                className="w-full bg-black hover:bg-gray-800 text-white"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Kirim Pesan
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Synergize Modal */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            <Zap className="h-4 w-4 mr-2" />
                            Synergize It!
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md p-0">
                          <div className="p-6">
                            <div className="mb-6">
                              <DialogTitle className="text-lg font-semibold mb-2">Bergabung dengan Proyek</DialogTitle>
                              <DialogDescription className="text-sm text-gray-500">
                                Ajukan diri Anda untuk bergabung dengan "{project.title}"
                              </DialogDescription>
                            </div>

                            {/* Project Summary */}
                            <div className="mb-6">
                              <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                              <div className="flex items-center gap-2 mb-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={project.recruiter.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {project.recruiter.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{project.recruiter.name}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {project.skills.slice(0, 4).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Application Form */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Mengapa Anda tertarik dengan proyek ini?
                                </label>
                                <Textarea
                                  placeholder="Jelaskan motivasi dan ketertarikan Anda..."
                                  value={applicationData.motivation}
                                  onChange={(e) =>
                                    setApplicationData({ ...applicationData, motivation: e.target.value })
                                  }
                                  className="min-h-[80px] resize-none"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Skill dan pengalaman relevan</label>
                                <Textarea
                                  placeholder="Ceritakan skill dan pengalaman yang mendukung..."
                                  value={applicationData.skills}
                                  onChange={(e) => setApplicationData({ ...applicationData, skills: e.target.value })}
                                  className="min-h-[80px] resize-none"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Kontribusi yang bisa Anda berikan
                                </label>
                                <Textarea
                                  placeholder="Apa yang bisa Anda kontribusikan untuk proyek ini..."
                                  value={applicationData.contribution}
                                  onChange={(e) =>
                                    setApplicationData({ ...applicationData, contribution: e.target.value })
                                  }
                                  className="min-h-[80px] resize-none"
                                />
                              </div>

                              <Button
                                onClick={handleSendApplication}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                Kirim Aplikasi
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center mt-12 gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
