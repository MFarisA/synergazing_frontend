www.synergazing.app
-----
# Synergazing - Platform Kolaborasi Proyek Mahasiswa
-----

## ✨ Fitur Utama

Synergazing dilengkapi dengan berbagai fitur untuk memfasilitasi kolaborasi yang efektif dan bermakna antar mahasiswa:

  * **🔎 Penemuan Proyek:** Jelajahi beragam proyek mahasiswa dari berbagai bidang, lengkap dengan filter canggih berdasarkan skill, lokasi, dan tipe proyek.
  * **➕ Pembuatan Proyek Multi-Tahap:** Buat halaman proyek Anda sendiri melalui wizard 5 langkah yang terstruktur untuk menarik kolaborator yang tepat.
  * **👥 Galeri Kolaborator:** Temukan calon rekan tim yang siap berkolaborasi, lihat profil lengkap mereka, termasuk keahlian dan portofolio.
  * **👤 Profil Pengguna Komprehensif:** Bangun profil profesional Anda, tambahkan keahlian, pengalaman, tautan sosial, dan unggah CV untuk meningkatkan visibilitas.
  * **📊 Dasbor Perekrut:** Kelola proyek yang Anda buat dan tinjau pelamar yang tertarik untuk bergabung dengan tim Anda.
  * **🔒 Otentikasi Aman:** Sistem pendaftaran dan login yang aman untuk melindungi akun pengguna.
  * **💬 Pesan Terintegrasi:** (Fitur Mendatang) Hubungi pemilik proyek atau calon kolaborator langsung melalui platform.

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan tumpukan teknologi modern untuk memastikan pengalaman pengguna yang cepat, responsif, dan andal.

### Frontend (Next.js)

  * **Framework:** [Next.js 15](https://nextjs.org/)
  * **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
  * **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  * **Komponen UI:** [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
  * **Animasi:** [Framer Motion](https://www.framer.com/motion/)
  * **Manajemen Form:** [React Hook Form](https://react-hook-form.com/)
  * **Ikon:** [Lucide React](https://lucide.dev/)

### Backend (Golang - *Terpisah*)

  * **Bahasa:** Golang Fiber
  * **API:** REST API
  * **Database:** PostgreSQL

-----

## 🚀 Memulai Proyek Secara Lokal

Ikuti langkah-langkah ini untuk menjalankan proyek frontend di lingkungan pengembangan lokal Anda.

### Prasyarat

  * [Node.js](https://nodejs.org/en/) (v18 atau lebih baru)
  * [Bun](https://bun.sh/) (sebagai package manager)

### Instalasi

1.  **Clone repositori ini:**

    ```bash
    git clone https://github.com/your-username/synergazing-frontend.git
    cd synergazing-frontend
    ```

2.  **Install dependensi:**

    ```bash
    bun install
    ```

3.  **Setup Environment Variables:**
    Buat file `.env.local` di root proyek dengan menyalin dari `.env.example`.

    ```bash
    cp .env.example .env.local
    ```

    Kemudian, sesuaikan isi `.env.local` jika diperlukan.

    ```env
    NEXT_PUBLIC_API_URL=https://synergazing.bahasakita.store
    ```

4.  **Jalankan server pengembangan:**

    ```bash
    bun dev
    ```

5.  Buka [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) di browser Anda untuk melihat hasilnya.

-----

## 📁 Struktur Proyek

Proyek ini menggunakan struktur **App Router** dari Next.js untuk organisasi file yang intuitif.

```
synergazing-frontend/
├── app/
│   ├── (auth)/             # Grup route untuk halaman otentikasi
│   │   ├── login/
│   │   └── register/
│   ├── (main)/             # Grup route untuk halaman utama dengan layout
│   │   ├── projects/
│   │   ├── profile/
│   │   ├── create-project/
│   │   └── ...
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Komponen UI dari Shadcn (Button, Card, dll.)
│   ├── layout/             # Komponen layout (Navbar, ChatBubble, dll.)
│   └── pages/              # Komponen spesifik untuk halaman tertentu
├── lib/
│   ├── api.ts              # Fungsi untuk fetch data ke backend API
│   ├── utils.ts            # Fungsi utilitas (e.g., cn)
│   └── data.ts             # Data statis/mock
├── public/                 # Aset statis (gambar, ikon)
└── types/
    └── index.ts            # Definisi tipe TypeScript
```


## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk detailnya.