import { CometCard } from "@/components/ui/comet-card";
import { Users, Search, Target, MessageCircle } from "lucide-react";

const featuresData = [
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

export function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Fitur Utama Platform
          </h2>
          <p className="mt-4 text-gray-600 md:text-xl max-w-[600px] mx-auto">
            Semua yang Anda butuhkan untuk kolaborasi proyek yang efektif
            dan bermakna
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {featuresData.map((feature, index) => (
            <CometCard key={index}>
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
  );
}