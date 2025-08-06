'use client';

import React, { useRef } from 'react'; // <-- TAMBAHKAN IMPORT INI
import { motion, useInView } from 'framer-motion';
import { Users, Search, Target, MessageCircle } from "lucide-react";
import { cn } from '@/lib/utils';

const featuresData = [
  {
    title: "Pusat Kolaborasi Mahasiswa",
    description: "Wadah terpusat untuk mahasiswa dari berbagai keahlian untuk berkolaborasi, menemukan proyek, dan membangun tim.",
    icon: <Users className="h-8 w-8" />,
  },
  {
    title: "Galeri Proyek",
    description: "Jelajahi berbagai proyek, temukan peluang yang sesuai dengan minat dan keahlian Anda melalui filter canggih.",
    icon: <Search className="h-8 w-8" />,
  },
  {
    title: "Kolaborator Talenta",
    description: "Temukan rekan tim dari berbagai universitas berdasarkan keahlian, lokasi, dan kesiapan untuk berkolaborasi.",
    icon: <Target className="h-8 w-8" />,
  },
  {
    title: "Mekanisme Kolaborasi Efektif",
    description: "Ajukan diri ke proyek dengan mudah dan berkoordinasi langsung dengan pemilik proyek melalui pesan terintegrasi.",
    icon: <MessageCircle className="h-8 w-8" />,
  },
];

// Helper untuk varian warna kartu
const colorVariants = {
  purple: {
    glow: "hover:shadow-purple-500/40",
    iconBg: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
  },
  blue: {
    glow: "hover:shadow-blue-500/40",
    iconBg: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
  },
  green: {
    glow: "hover:shadow-green-500/40",
    iconBg: "from-green-500/20 to-green-500/5",
    iconColor: "text-green-400",
  },
  orange: {
    glow: "hover:shadow-orange-500/40",
    iconBg: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-400",
  },
};

const colorCycle = ['purple', 'blue', 'green', 'orange'] as const;


export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="features"
      className="w-full py-12 md:py-24 lg:py-32"
    >
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
            Fitur Utama Platform
          </h2>
          <p className="mt-4 text-gray-600 md:text-xl max-w-[600px] mx-auto">
            Semua yang Anda butuhkan untuk kolaborasi proyek yang efektif dan bermakna
          </p>
        </div>

        <div ref={ref} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {featuresData.map((feature, index) => {
            const variant = colorCycle[index % colorCycle.length];
            const colors = colorVariants[variant];

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1 + 0.2,
                  ease: 'easeOut',
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={cn(
                  "relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/40 bg-background/50 p-8 shadow-lg transition-shadow duration-300",
                  colors.glow
                )}
              >
                <div>
                  <div className={cn(
                    "mb-6 inline-flex aspect-square h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br backdrop-blur-sm",
                    colors.iconBg
                  )}>
                    {/* Clone icon to add new classes */}
                    {React.cloneElement(feature.icon, {
                      className: cn(feature.icon.props.className, colors.iconColor)
                    })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-700">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
