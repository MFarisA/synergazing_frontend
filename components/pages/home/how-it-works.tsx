export function HowItWorks() {
    return (
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
                untuk menarik kolaborator yang tepat.
              </p>
            </div>
  
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Jelajahi & Bergabung</h3>
              <p className="text-gray-600">
                Temukan proyek yang sesuai minat atau posting proyek Anda
                sendiri untuk mencari tim.
              </p>
            </div>
  
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Kolaborasi & Sukses</h3>
              <p className="text-gray-600">
                Gunakan tools manajemen proyek dan komunikasi untuk
                menyelesaikan proyek bersama tim.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }