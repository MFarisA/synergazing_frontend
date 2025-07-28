"use client"

import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function Navbar({ className }: { className?: string }) {
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [visible, setVisible] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10)
      setPrevScrollPos(currentScrollPos)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [prevScrollPos])

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/projects", label: "Proyek" },
    { href: "/profile", label: "Profile" },
  ]

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <nav
        className={cn(
          // Pill-shaped container
          "flex items-center justify-between",
          "px-6 py-3 rounded-full",
          // Glass effect styling
          "bg-black/30 backdrop-blur-lg border border-white/20",
          "shadow-2xl shadow-black/20",
          // Smooth transitions
          "transition-all duration-300",
          // Hide/show animation
          visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          className,
        )}
      >
        {/* Logo section */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">Synergazing</span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6 ml-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium transition-all duration-200",
                "px-4 py-2 rounded-full",
                pathname === href
                  ? "text-white bg-white/15 backdrop-blur-sm border border-white/30"
                  : "text-gray-300 hover:text-white hover:bg-white/10",
              )}
            >
              {label}
            </Link>
          ))}

          {/* Login button */}
          <Button
            size="sm"
            className={cn(
              "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
              "border border-white/30 backdrop-blur-sm rounded-full",
              "hover:from-blue-400 hover:to-purple-500",
              "shadow-lg hover:shadow-xl transition-all duration-200",
              "hover:scale-105 px-6",
            )}
            asChild
          >
            <Link href="/login">Masuk</Link>
          </Button>
        </div>
      </nav>
    </div>
  )
}
