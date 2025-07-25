"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Zap,
  Send,
  Star,
  GraduationCap,
} from "lucide-react"

const projects = [
  {
    id: 1,
    title: "Aplikasi Smart Campus IoT",
    description:
      "Mengembangkan sistem IoT untuk monitoring fasilitas kampus dengan dashboard real-time dan notifikasi otomatis",
    recruiter: {
      name: "Ahmad Maulana",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Teknik Informatika",
      university: "ITB",
      rating: 4.8,
    },
    skills: ["React", "IoT", "Python", "Arduino"],
    duration: "3 bulan",
    members: "2/5",
    type: "Tugas Akhir",
    location: "Bandung",
    posted: "2 hari yang lalu",
    image: "/placeholder.svg?height=200&width=300",
    urgent: true,
  },
  {
    id: 2,
    title: "Kampanye Sosial Lingkungan",
    description:
      "Merancang kampanye kreatif untuk meningkatkan kesadaran lingkungan di kalangan mahasiswa dengan pendekatan multimedia",
    recruiter: {
      name: "Sari Rahayu",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Desain Komunikasi Visual",
      university: "UNPAD",
      rating: 4.9,
    },
    skills: ["Design", "Marketing", "Video Editing", "Social Media"],
    duration: "2 bulan",
    members: "4/6",
    type: "Lomba",
    location: "Bandung",
    posted: "1 hari yang lalu",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Riset AI untuk Kesehatan",
    description:
      "Penelitian pengembangan model AI untuk diagnosis dini penyakit berbasis data medis menggunakan deep learning",
    recruiter: {
      name: "Dr. Pratama",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Dosen Peneliti",
      university: "UI",
      rating: 5.0,
    },
    skills: ["Machine Learning", "Python", "TensorFlow", "Research"],
    duration: "6 bulan",
    members: "1/3",
    type: "Riset Dosen",
    location: "Jakarta",
    posted: "3 hari yang lalu",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "E-commerce Platform UMKM",
    description:
      "Membangun platform e-commerce khusus untuk UMKM dengan fitur inventory management dan payment gateway",
    recruiter: {
      name: "Budi Santoso",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Sistem Informasi",
      university: "UGM",
      rating: 4.7,
    },
    skills: ["Laravel", "Vue.js", "MySQL", "Payment Gateway"],
    duration: "4 bulan",
    members: "3/5",
    type: "Startup",
    location: "Yogyakarta",
    posted: "1 minggu yang lalu",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    title: "Game Edukasi Matematika",
    description:
      "Mengembangkan game mobile edukatif untuk pembelajaran matematika tingkat SD dengan gamifikasi yang menarik",
    recruiter: {
      name: "Lisa Permata",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Teknik Informatika",
      university: "ITS",
      rating: 4.6,
    },
    skills: ["Unity", "C#", "Game Design", "UI/UX"],
    duration: "5 bulan",
    members: "2/4",
    type: "Tugas Akhir",
    location: "Surabaya",
    posted: "4 hari yang lalu",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    title: "Sistem Manajemen Perpustakaan",
    description:
      "Digitalisasi sistem perpustakaan dengan fitur peminjaman online, katalog digital, dan notifikasi otomatis",
    recruiter: {
      name: "Andi Wijaya",
      avatar: "/placeholder.svg?height=40&width=40",
      major: "Teknik Komputer",
      university: "UNHAS",
      rating: 4.5,
    },
    skills: ["PHP", "CodeIgniter", "MySQL", "Bootstrap"],
    duration: "3 bulan",
    members: "1/4",
    type: "Kuliah",
    location: "Makassar",
    posted: "5 hari yang lalu",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === "all" || project.type === selectedType
    const matchesLocation = selectedLocation === "all" || project.location === selectedLocation

    return matchesSearch && matchesType && matchesLocation
  })

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle message sending logic here
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Jelajahi Proyek</h1>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari proyek, skill, atau kata kunci..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipe" />
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
                <SelectTrigger className="w-[140px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lokasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Lokasi</SelectItem>
                  <SelectItem value="Jakarta">Jakarta</SelectItem>
                  <SelectItem value="Bandung">Bandung</SelectItem>
                  <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                  <SelectItem value="Surabaya">Surabaya</SelectItem>
                  <SelectItem value="Makassar">Makassar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="relative">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {project.urgent && <Badge className="absolute top-2 left-2 bg-red-500">Urgent</Badge>}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{project.type}</Badge>
                  <span className="text-sm text-gray-500">{project.posted}</span>
                </div>
                <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Recruiter Info */}
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
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{project.recruiter.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <GraduationCap className="h-3 w-3" />
                      <span className="truncate">{project.recruiter.major}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{project.recruiter.rating}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {project.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.skills.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Project Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{project.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{project.members}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => setSelectedProject(project)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Chat dengan Recruiter</DialogTitle>
                        <DialogDescription>Tanyakan detail proyek kepada {project.recruiter.name}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Recruiter Info */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar>
                            <AvatarImage src={project.recruiter.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {project.recruiter.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{project.recruiter.name}</p>
                            <p className="text-sm text-gray-500">
                              {project.recruiter.major} - {project.recruiter.university}
                            </p>
                          </div>
                        </div>

                        {/* Quick Questions */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Pertanyaan Cepat:</p>
                          <div className="grid grid-cols-1 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto p-2 bg-transparent"
                              onClick={() => setMessage("Halo! Bisa dijelaskan lebih detail tentang proyek ini?")}
                            >
                              Bisa dijelaskan lebih detail tentang proyek ini?
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto p-2 bg-transparent"
                              onClick={() => setMessage("Skill apa saja yang paling dibutuhkan untuk proyek ini?")}
                            >
                              Skill apa yang paling dibutuhkan?
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto p-2 bg-transparent"
                              onClick={() => setMessage("Bagaimana sistem kerja dan timeline proyeknya?")}
                            >
                              Bagaimana timeline dan sistem kerjanya?
                            </Button>
                          </div>
                        </div>

                        {/* Message Input */}
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Tulis pesan Anda..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <Button onClick={handleSendMessage} className="w-full">
                            <Send className="h-4 w-4 mr-2" />
                            Kirim Pesan
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                        onClick={() => setSelectedProject(project)}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Synergize It!
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Bergabung dengan Proyek</DialogTitle>
                        <DialogDescription>Ajukan diri Anda untuk bergabung dengan "{project.title}"</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Project Summary */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">{project.title}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={project.recruiter.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {project.recruiter.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{project.recruiter.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {project.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Application Form */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Mengapa Anda tertarik dengan proyek ini?</label>
                            <Textarea placeholder="Jelaskan motivasi dan ketertarikan Anda..." className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Skill dan pengalaman relevan</label>
                            <Textarea placeholder="Ceritakan skill dan pengalaman yang mendukung..." className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Kontribusi yang bisa Anda berikan</label>
                            <Textarea
                              placeholder="Apa yang bisa Anda kontribusikan untuk proyek ini..."
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                          <Zap className="h-4 w-4 mr-2" />
                          Kirim Aplikasi
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada proyek ditemukan</h3>
            <p className="text-gray-500">Coba ubah filter pencarian atau kata kunci Anda</p>
          </div>
        )}
      </div>
    </div>
  )
}
