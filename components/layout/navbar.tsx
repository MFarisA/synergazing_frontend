"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Navbar({ className }: { className?: string }) {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      // Set the navbar to be visible if scrolling up or at the top of the page
      setVisible((prevScrollPos > currentScrollPos) || currentScrollPos < 10);

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos]);

  return (
    <header
      className={cn(
        "px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full",
        className
      )}
    >
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
          href="/"
          className="text-sm font-medium hover:text-blue-600 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/projects"
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
  );
}