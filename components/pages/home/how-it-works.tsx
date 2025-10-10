'use client';

import React, { useRef, useState, useEffect } from 'react';
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

// Hook to detect mobile and performance capability
const useDeviceCapability = () => {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if it's a mobile device
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Performance check for low-end devices
    const start = performance.now();
    for (let i = 0; i < 50000; i++) {
      Math.random() * Math.random();
    }
    const end = performance.now();
    
    const isSlowCPU = (end - start) > 8;
    const hasLowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2;
    
    setIsLowEndDevice(isSlowCPU || hasLowCores || hasLowMemory || checkMobile);
  }, []);

  return { isLowEndDevice, isMobile };
};

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const { isLowEndDevice, isMobile } = useDeviceCapability();

  // Simplified animation variants for low-end devices
  const getAnimationProps = (index: number) => {
    if (isLowEndDevice) {
      // Simpler animations for low-end devices
      return {
        initial: { opacity: 0 },
        animate: inView ? { opacity: 1 } : {},
        transition: {
          duration: 0.3,
          delay: index * 0.1,
          ease: "easeOut" as const,
        },
      };
    }
    
    // Full animations for high-end devices
    return {
      initial: { opacity: 0, y: 30 },
      animate: inView ? { opacity: 1, y: 0 } : {},
      transition: {
        duration: 0.6,
        delay: index * 0.15,
        ease: "easeOut" as const,
      },
    };
  };

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
              {...getAnimationProps(index)}
              className={cn(
                "group relative text-center overflow-hidden rounded-2xl border border-border/40 p-8 shadow-lg",
                // Conditional styling based on device capability
                isLowEndDevice 
                  ? "bg-background/80" // Simpler background for low-end devices
                  : "bg-background/50", // Original background with backdrop effects
                isMobile && "transform-gpu" // Enable GPU acceleration on mobile
              )}
            >
              {/* Conditionally render BorderBeam only on high-end devices */}
              {!isLowEndDevice && (
                <BorderBeam
                  size={350}
                  duration={10}
                  delay={9 + index * 2}
                  className="via-blue-800 from-transparent to-transparent"
                />
              )}

              <div 
                className={cn(
                  "mb-6 w-20 h-20 rounded-full flex items-center justify-center mx-auto",
                  isLowEndDevice 
                    ? "bg-blue-500 shadow-md" // Simplified gradient for low-end devices
                    : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg" // Original gradient
                )}
              >
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
