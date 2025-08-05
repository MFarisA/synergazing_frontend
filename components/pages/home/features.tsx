import { Users, Search, Target, MessageCircle } from "lucide-react";

const featuresData = [
  {
    // Fitur baru yang menggantikan portofolio, menekankan fungsi sebagai pusat kolaborasi.
    title: "Pusat Kolaborasi Mahasiswa",
    description: "Wadah terpusat yang berfungsi sebagai titik temu bagi mahasiswa dari seluruh latar belakang keahlian untuk berkolaborasi, menemukan proyek, dan membangun tim impian.",
    icon: <Users className="h-8 w-8 text-blue-400" />,
    imgSrc:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    // 'Marketplace Proyek' diubah menjadi 'Galeri Proyek'
    title: "Galeri Proyek",
    description: "Jelajahi berbagai proyek yang dipublikasikan oleh mahasiswa lain, temukan peluang yang sesuai dengan minat dan keahlian Anda melalui filter pencarian yang canggih.",
    icon: <Search className="h-8 w-8 text-purple-400" />,
    imgSrc:
      "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    // 'Marketplace Talenta' diubah menjadi 'Direktori Talenta'
    title: "Kolaborator Talenta",
    description: "Temukan rekan tim secara proaktif dari berbagai universitas berdasarkan keahlian, lokasi, dan kesiapan berkolaborasi untuk meruntuhkan batasan antar jurusan.",
    icon: <Target className="h-8 w-8 text-green-400" />,
    imgSrc:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    // Deskripsi disesuaikan agar lebih fokus pada proses lamaran dan komunikasi.
    title: "Mekanisme Kolaborasi Efektif",
    description: "Ajukan diri ke proyek dengan mudah melalui fitur 'Synergize It!' dan berkoordinasi langsung dengan pemilik proyek melalui fitur pesan terintegrasi yang efektif.",
    icon: <MessageCircle className="h-8 w-8 text-orange-400" />,
    imgSrc:
      "https://images.unsplash.com/photo-1573495627361-d9b87960b12d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-100 min-h-screen relative overflow-hidden"
    >
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent"></div>
      
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
            Fitur Utama Platform
          </h2>
          <p className="mt-4 text-gray-600 md:text-xl max-w-[600px] mx-auto">
            Semua yang Anda butuhkan untuk kolaborasi proyek yang efektif dan bermakna
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {featuresData.map((feature, index) => (
            // CometCard diganti dengan div biasa.
            // Kelas 'group' dan 'transition' ditambahkan untuk efek hover.
            <div 
              key={index} 
              className="group flex h-full w-full cursor-pointer flex-col items-stretch rounded-2xl border-0 overflow-hidden backdrop-blur-2xl bg-white/5 border-2 border-white/20 shadow-xl shadow-black/20 relative transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
            >
              {/* === Mulai salinan style dari dalam CometCard === */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/5 to-white/10 rounded-2xl pointer-events-none"></div>
              
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <img
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-300"
                  alt={feature.title}
                  src={feature.imgSrc || "/placeholder.svg"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
              </div>

              <div className="flex flex-col flex-1 p-6 text-left backdrop-blur-xl bg-white/10 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  {feature.icon}
                  <h3 className="text-xl font-bold text-gray-900 mt-4 drop-shadow-sm">{feature.title}</h3>
                  <p className="text-sm text-gray-700 mt-2 drop-shadow-sm">{feature.description}</p>
                </div>
              </div>
              {/* === Selesai salinan style === */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}