import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Cta() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Siap Memulai Kolaborasi?
          </h2>
          <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl mb-8">
            Bergabunglah dengan ribuan mahasiswa yang sudah menemukan
            partner proyek ideal mereka.
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
  );
}