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
import {
  Users,
  Search,
  MessageCircle,
  Briefcase,
  GraduationCap,
  Target,
  Zap,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";
// Import the new CometCard component
import { CometCard } from "@/components/ui/comet-card";
// Import AuroraBackground component
import { AuroraBackground } from "@/components/ui/aurora-background";

// Data for the features section, making the code cleaner to map over
const features = [
  {
    title: "Profil Komprehensif",
    description:
      "Buat profil detail dengan skills, pengalaman, dan portofolio proyek seperti LinkedIn.",
    icon: <Users className="h-8 w-8 text-blue-400" />,
    imgSrc:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Eksplorasi Proyek",
    description:
      "Jelajahi proyek dengan mudah seperti marketplace, dengan filter canggih dan pencarian.",
    icon: <Search className="h-8 w-8 text-purple-400" />,
    imgSrc:
      "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Manajemen Proyek",
    description:
      "Kelola tim dan progres dengan Kanban board, rekrut anggota, dan track milestone.",
    icon: <Target className="h-8 w-8 text-green-400" />,
    imgSrc:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Komunikasi Langsung",
    description:
      "Sistem pesan internal untuk diskusi proyek dan koordinasi tim yang efektif.",
    icon: <MessageCircle className="h-8 w-8 text-orange-400" />,
    imgSrc:
      "https://images.unsplash.com/photo-1573495627361-d9b87960b12d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">Synergazing</span>
          </div>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Fitur
          </Link>
          <Link
            href="#projects"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Proyek
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Tentang
          </Link>
          <Button variant="outline" size="sm">
            Masuk
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Daftar
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section with Aurora Background */}
        <AuroraBackground className="w-full py-12 md:py-24 lg:py-32 h-full min-h-[100vh]">
          <div className="container px-4 md:px-6 mx-auto z-10 relative">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Platform Kolaborasi Proyek Mahasiswa
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300">
                  Temukan rekan kolaborasi yang tepat, bergabung dengan proyek
                  menarik, atau rekrut talenta terbaik untuk proyek Anda.
                  Seperti LinkedIn bertemu Facebook Marketplace untuk mahasiswa.
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Mulai Berkolaborasi
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Jelajahi Proyek
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-8">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>1000+ Mahasiswa</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>500+ Proyek Aktif</span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>50+ Kampus</span>
                </div>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Gradient transition between hero and features */}
        <div className="w-full h-24 bg-gradient-to-b from-transparent via-white/70 to-white"></div>

        {/* --- MODIFIED FEATURES SECTION --- */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Fitur Utama Platform
              </h2>
              <p className="mt-4 text-gray-600 md:text-xl max-w-[600px] mx-auto">
                Semua yang Anda butuhkan untuk kolaborasi proyek yang efektif
                dan bermakna
              </p>`
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <CometCard key={index}>
                  {/* PERUBAHAN DI SINI: ganti <button> menjadi <div> */}
                  <div className="flex h-full w-full cursor-pointer flex-col items-stretch rounded-lg border-0 bg-[#1F2121] overflow-hidden">
                    <div className="relative w-full aspect-[4/3]">
                      <img
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover contrast-75 group-hover:contrast-100 transition-all duration-300"
                        alt={feature.title}
                        src={feature.imgSrc}
                      />
                    </div>
                    <div className="flex flex-col flex-1 p-6 text-left">
                      {feature.icon}
                      <h3 className="text-xl font-bold text-white mt-4">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-2">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CometCard>
              ))}
            </div>
          </div>
        </section>
        {/* --- END OF MODIFIED FEATURES SECTION --- */}

        {/* Project Showcase */}
        <section
          id="projects"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-50"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Proyek Terbaru
              </h2>
              <p className="mt-4 text-gray-600 md:text-xl max-w-[600px] mx-auto">
                Temukan proyek menarik yang sedang mencari kolaborator
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>AM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Ahmad Maulana</p>
                      <p className="text-sm text-gray-500">
                        Teknik Informatika
                      </p>
                    </div>
                  </div>
                  <CardTitle className="text-lg">
                    Aplikasi Smart Campus IoT
                  </CardTitle>
                  <CardDescription>
                    Mengembangkan sistem IoT untuk monitoring fasilitas kampus
                    dengan dashboard real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">React</Badge>
                    <Badge variant="secondary">IoT</Badge>
                    <Badge variant="secondary">Python</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>3 bulan</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>2/5 anggota</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Synergize It!
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>SR</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Sari Rahayu</p>
                      <p className="text-sm text-gray-500">
                        Desain Komunikasi Visual
                      </p>
                    </div>
                  </div>
                  <CardTitle className="text-lg">
                    Kampanye Sosial Lingkungan
                  </CardTitle>
                  <CardDescription>
                    Merancang kampanye kreatif untuk meningkatkan kesadaran
                    lingkungan di kalangan mahasiswa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Design</Badge>
                    <Badge variant="secondary">Marketing</Badge>
                    <Badge variant="secondary">Video</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>2 bulan</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>4/6 anggota</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Synergize It!
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>DP</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Dr. Pratama</p>
                      <p className="text-sm text-gray-500">Dosen Peneliti</p>
                    </div>
                  </div>
                  <CardTitle className="text-lg">
                    Riset AI untuk Kesehatan
                  </CardTitle>
                  <CardDescription>
                    Penelitian pengembangan model AI untuk diagnosis dini
                    penyakit berbasis data medis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Machine Learning</Badge>
                    <Badge variant="secondary">Python</Badge>
                    <Badge variant="secondary">Research</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>6 bulan</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>1/3 anggota</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Synergize It!
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Lihat Semua Proyek
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Cara Kerja Platform
              </h2>
              <p className="mt-4 text-gray-600 md:text-xl max-w-[600px] mx-auto">
                Tiga langkah mudah untuk memulai kolaborasi
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Buat Profil</h3>
                <p className="text-gray-600">
                  Lengkapi profil Anda dengan skills, pengalaman, dan minat
                  untuk menarik kolaborator yang tepat
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Jelajahi & Bergabung</h3>
                <p className="text-gray-600">
                  Temukan proyek yang sesuai minat atau posting proyek Anda
                  sendiri untuk mencari tim
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Kolaborasi & Sukses</h3>
                <p className="text-gray-600">
                  Gunakan tools manajemen proyek dan komunikasi untuk
                  menyelesaikan proyek bersama tim
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Siap Memulai Kolaborasi?
              </h2>
              <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl mb-8">
                Bergabunglah dengan ribuan mahasiswa yang sudah menemukan
                partner proyek ideal mereka
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Input
                  placeholder="Masukkan email Anda"
                  className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-white/70"
                />
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Daftar Sekarang
                </Button>
              </div>
              <p className="text-sm text-blue-100 mt-4">
                Gratis untuk mahasiswa. Mulai kolaborasi dalam hitungan menit.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Synergazing</span>
        </div>
        <p className="text-xs text-gray-500 sm:ml-4">
          © 2025 Synergazing Platform kolaborasi untuk mahasiswa Indonesia.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-gray-500"
          >
            Kebijakan Privasi
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-gray-500"
          >
            Syarat Layanan
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-gray-500"
          >
            Kontak
          </Link>
        </nav>
      </footer>
    </div>
  );
}
