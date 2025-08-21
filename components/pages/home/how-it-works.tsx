'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BorderBeam } from '@/components/ui/border-beam'; // Impor komponen BorderBeam

const stepsData = [
  {
    title: "Buat Profil",
    description: "Lengkapi profil Anda dengan skills, pengalaman, dan minat untuk menarik kolaborator yang tepat.",
  },
  {
    title: "Jelajahi & Bergabung",
    description: "Temukan proyek yang sesuai minat atau posting proyek Anda sendiri untuk mencari tim.",
  },
  {
    title: "Kolaborasi & Sukses",
    description: "Gunakan tools manajemen proyek dan komunikasi untuk menyelesaikan proyek bersama tim.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
            Cara Kerja Platform
          </h2>
          <p className="mt-4 text-gray-600 md:text-xl max-w-[600px] mx-auto">
            Tiga langkah mudah untuk memulai kolaborasi
          </p>
        </div>

        <div ref={ref} className="grid gap-8 md:grid-cols-3">
          {stepsData.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: 'easeOut',
              }}
              className="group relative text-center overflow-hidden rounded-2xl border border-border/40 bg-background/50 p-8 shadow-lg"
            >
              <BorderBeam
                size={350}
                duration={10}
                delay={9 + index * 2}
                // DIUBAH: Opacity /40 dihapus agar warna lebih terang
                className="via-blue-800 from-transparent to-transparent"
              />

              <div className="mb-6 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white font-bold text-3xl">{index + 1}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
              <p className="text-gray-700">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
