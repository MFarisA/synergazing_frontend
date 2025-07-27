"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  MapPin,
  Users,
  MessageCircle,
  Zap,
  Github,
  Globe,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Award,
  Eye,
  Heart,
  Share2,
  Plus,
  Settings,
  Camera,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

// Mock user data - in real app, this would come from API/auth
const userData = {
  id: 1,
  name: "Ahmad Maulana",
  username: "ahmadmaulana",
  avatar:
    "https://mahasiswa.dinus.ac.id/images/foto/A/A11/2022/A11.2022.14148.jpg",
  title: "Full-Stack Developer & IoT Enthusiast",
  university: "Institut Teknologi Bandung",
  major: "Teknik Informatika",
  year: "Semester 7",
  location: "Bandung, Indonesia",
  bio: "Passionate about creating innovative solutions through technology. Experienced in full-stack development with a focus on IoT systems and real-time applications. Always eager to collaborate on meaningful projects that make a difference.",
  email: "ahmad.maulana@students.itb.ac.id",
  phone: "+62 812-3456-7890",

  // Stats
  stats: {
    projects: 12,
    completedProjects: 8,
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

  // Projects
  projects: [
    {
      id: 1,
      title: "Smart Campus IoT System",
      description:
        "IoT-based monitoring system for campus facilities with real-time dashboard",
      image: "/placeholder.svg?height=200&width=300&text=IoT+Campus",
      status: "In Progress",
      role: "Project Lead",
      technologies: ["React", "Node.js", "Arduino", "MongoDB"],
      team: 5,
      duration: "3 months",
      completion: 75,
      likes: 23,
    },
    {
      id: 2,
      title: "E-Learning Platform",
      description:
        "Modern learning management system with interactive features",
      image: "/placeholder.svg?height=200&width=300&text=E-Learning",
      status: "Completed",
      role: "Full-Stack Developer",
      technologies: ["Vue.js", "Laravel", "MySQL"],
      team: 4,
      duration: "4 months",
      completion: 100,
      likes: 45,
    },
    {
      id: 3,
      title: "Mobile Health App",
      description:
        "Health tracking application with AI-powered recommendations",
      image: "/placeholder.svg?height=200&width=300&text=Health+App",
      status: "Completed",
      role: "Mobile Developer",
      technologies: ["React Native", "Firebase", "TensorFlow"],
      team: 3,
      duration: "2 months",
      completion: 100,
      likes: 31,
    },
  ],

  // Experience/Collaborations
  experience: [
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
      description:
        "Redesigned and developed the university student portal with modern UI/UX.",
      skills: ["React", "UI/UX", "TypeScript"],
    },
    {
      title: "Research Assistant",
      project: "AI for Healthcare Research",
      period: "Jun 2023 - Aug 2023",
      description:
        "Assisted in developing machine learning models for medical diagnosis.",
      skills: ["Python", "Machine Learning", "Data Analysis"],
    },
  ],

  // Social links
  socialLinks: {
    github: "https://github.com/ahmadmaulana",
    linkedin: "https://linkedin.com/in/ahmadmaulana",
    instagram: "https://instagram.com/ahmadmaulana",
    portfolio: "https://ahmadmaulana.dev",
  },

};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [editData, setEditData] = useState({
    bio: userData.bio,
    title: userData.title,
    location: userData.location,
  });

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
  ];
  const [selectedSkillCategory, setSelectedSkillCategory] = useState("All");

  const filteredSkills =
    selectedSkillCategory === "All"
      ? userData.skills
      : userData.skills.filter(
          (skill) => skill.category === selectedSkillCategory
        );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6 -mt-16 relative">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                      <AvatarImage
                        src={userData.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-2xl">
                        {userData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 p-0 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 pt-16 md:pt-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold">{userData.name}</h1>
                        <p className="text-lg text-gray-600">
                          {userData.title}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>{userData.university}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{userData.location}</span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profil
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {userData.stats.projects}
                        </p>
                        <p className="text-sm text-gray-600">Proyek</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {userData.stats.completedProjects}
                        </p>
                        <p className="text-sm text-gray-600">Selesai</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Proyek</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tentang Saya</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {userData.bio}
                    </p>
                  </CardContent>
                </Card>

                {/* Experience */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pengalaman Kolaborasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {userData.experience.map((exp, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{exp.title}</h4>
                            <p className="text-blue-600 font-medium">
                              {exp.project}
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                              {exp.period}
                            </p>
                            <p className="text-gray-700 mb-3">
                              {exp.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {exp.skills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className="text-xs"
                                >
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
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Proyek Saya ({userData.projects.length})
                  </h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Proyek
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userData.projects.map((project) => (
                    <Card
                      key={project.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Badge
                          className={`absolute top-3 left-3 ${
                            project.status === "Completed"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {project.status}
                        </Badge>
                      </div>

                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {project.title}
                        </CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>
                            Role:{" "}
                            <span className="font-medium">{project.role}</span>
                          </span>
                          <span>{project.team} anggota tim</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>

                        {project.status === "In Progress" && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                Progress
                              </span>
                              <span className="text-sm text-gray-600">
                                {project.completion}%
                              </span>
                            </div>
                            <Progress
                              value={project.completion}
                              className="h-2"
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat Detail
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Skills & Keahlian</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Skill
                  </Button>
                </div>

                {/* Skill Categories */}
                <div className="flex flex-wrap gap-2">
                  {skillCategories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedSkillCategory === category
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedSkillCategory(category)}
                      className={
                        selectedSkillCategory !== category
                          ? "bg-transparent"
                          : ""
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSkills.map((skill) => (
                    <Card key={skill.name}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{skill.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress
                            value={skill.level}
                            className="flex-1 h-2"
                          />
                          <span className="text-sm font-medium text-gray-600">
                            {skill.level}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                    <p className="text-sm text-gray-600">{userData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Telepon</p>
                    <p className="text-sm text-gray-600">{userData.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={userData.socialLinks.github}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="text-sm">GitHub</span>
                  <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                </a>
                <a
                  href={userData.socialLinks.linkedin}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">LinkedIn</span>
                  <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                </a>
                <a
                  href={userData.socialLinks.instagram}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <span className="text-sm">Instagram</span>
                  <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                </a>
                <a
                  href={userData.socialLinks.portfolio}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Portfolio</span>
                  <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                </a>
              </CardContent>
            </Card>


            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/create-project">
                  <Button variant="outline" className="w-full justify-start bg-transparent mb-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Proyek Baru
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Cari Kolaborator
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Pesan Masuk
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <div className="p-6">
            <DialogTitle className="text-xl font-semibold mb-6">
              Edit Profil
            </DialogTitle>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Judul Profil
                </label>
                <Input
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  placeholder="e.g. Full-Stack Developer & IoT Enthusiast"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lokasi</label>
                <Input
                  value={editData.location}
                  onChange={(e) =>
                    setEditData({ ...editData, location: e.target.value })
                  }
                  placeholder="e.g. Bandung, Indonesia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <Textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  placeholder="Ceritakan tentang diri Anda..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setIsEditing(false)} className="flex-1">
                  Simpan Perubahan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="bg-transparent"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
