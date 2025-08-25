"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, User, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function Navbar({ className }: { className?: string }) {
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [visible, setVisible] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<{ name?: string } | null>(null)

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      setIsLoggedIn(true)
      try {
        setUserData(JSON.parse(user))
      } catch (error) {
        console.error("Failed to parse user data:", error)
      }
    } else {
      setIsLoggedIn(false)
      setUserData(null)
    }
  }, [pathname]) // Re-check when pathname changes

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const currentScrollPos = window.scrollY;
  //     setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
  //     setPrevScrollPos(currentScrollPos);
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [prevScrollPos]);

  // Filter navLinks based on login status - removing profile from main navbar
  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/projects", label: "Proyek" },
    { href: "/collaborators", label: "Kolaborator" },
    // Profile link is removed from main navbar and only accessible from dropdown
  ]

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUserData(null)
    setMobileMenuOpen(false)

    // Redirect to home page
    router.push("/")
  }

  // Sample notifications data
  const notifications = [
    { id: 1, message: "Anda memiliki 3 proyek baru.", read: false },
    { id: 2, message: "Kolaborator baru bergabung dengan proyek 'Desain UI'.", read: true },
    { id: 3, message: "Pembaruan pada 'Synergazing v2.0' tersedia.", read: false },
    { id: 4, message: "Proyek 'Pengembangan Aplikasi Mobile' telah selesai.", read: false },
  ]

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  return (
    <header
      className={cn(
        "px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full",
        className,
      )}
    >
      <Link href="/" className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image 
              src="/synergazing.svg" 
              alt="Synergazing Logo" 
              width={20} 
              height={20} 
              className="text-white" 
            />
          </div>
          <span className="font-bold text-xl">Synergazing</span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === href ? "text-blue-600 font-semibold" : "hover:text-blue-600 text-gray-700",
            )}
          >
            {label}
          </Link>
        ))}

        {isLoggedIn && (
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadNotificationsCount}
                    </span>
                  )}
                  <span className="sr-only">Notifikasi</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                    >
                      <span className={cn("text-sm", notification.read ? "text-gray-500" : "font-medium")}>
                        {notification.message}
                      </span>
                      {!notification.read && <span className="text-xs text-blue-600">Baru</span>}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem className="text-gray-500">Tidak ada notifikasi baru.</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span>{userData?.name || "Pengguna"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/edit">Edit Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button size="sm" className="bg-primary text-white" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
        )}
      </nav>

      {/* Mobile Navigation */}
      <div className="ml-auto md:hidden flex items-center gap-2">
        {isLoggedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadNotificationsCount}
                  </span>
                )}
                <span className="sr-only">Notifikasi</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                  >
                    <span className={cn("text-sm", notification.read ? "text-gray-500" : "font-medium")}>
                      {notification.message}
                    </span>
                    {!notification.read && <span className="text-xs text-blue-600">Baru</span>}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="text-gray-500">Tidak ada notifikasi baru.</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Menu</span>
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/95 border-b shadow-lg md:hidden">
          <nav className="flex flex-col p-4 space-y-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors py-2",
                  pathname === href ? "text-blue-600 font-semibold" : "hover:text-blue-600 text-gray-700",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            
            <div className="border-t pt-4">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {userData?.name || "Pengguna"}
                  </div>
                  <Link
                    href="/profile"
                    className="block text-sm text-gray-700 hover:text-blue-600 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="block text-sm text-gray-700 hover:text-blue-600 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Edit Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-sm text-red-600 hover:text-red-700 py-1 text-left"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <Button size="sm" className="bg-primary text-white w-full" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Masuk</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
