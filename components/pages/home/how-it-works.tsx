export function HowItWorks() {
  return (
    <section
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-100 relative overflow-hidden"
    >
      {/* Sama persis seperti Features */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent"></div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
            Cara Kerja Platform
          </h2>
          <p className="mt-4 text-gray-600 md:text-xl max-w-[600px] mx-auto">
            Tiga langkah mudah untuk memulai kolaborasi
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Card Step */}
          {[1, 2, 3].map((step) => {
            const titles = [
              "Buat Profil",
              "Jelajahi & Bergabung",
              "Kolaborasi & Sukses",
            ];
            const descriptions = [
              "Lengkapi profil Anda dengan skills, pengalaman, dan minat untuk menarik kolaborator yang tepat.",
              "Temukan proyek yang sesuai minat atau posting proyek Anda sendiri untuk mencari tim.",
              "Gunakan tools manajemen proyek dan komunikasi untuk menyelesaikan proyek bersama tim.",
            ];
            return (
              <div
                key={step}
                className="text-center backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-lg p-6 transition-all hover:scale-[1.03]"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{step}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{titles[step - 1]}</h3>
                <p className="text-gray-700">{descriptions[step - 1]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
