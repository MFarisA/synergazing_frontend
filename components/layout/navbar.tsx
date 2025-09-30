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
import { Bell, LogOut, User, Menu, X, Check, Trash2, CheckCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { 
  getAllNotifications, 
  getUnreadNotificationCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  formatNotificationTime,
  getNotificationIcon,
  type Notification 
} from "@/lib/api/notifications"

export default function Navbar({ className }: { className?: string }) {
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [visible, setVisible] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<{ name?: string } | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)

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

  // Fetch notifications when user is logged in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isLoggedIn) {
        setNotifications([])
        setUnreadNotificationsCount(0)
        return
      }

      // Check if we have a token
      const token = localStorage.getItem("token")
      if (!token) {
        console.warn("No authentication token found")
        setNotifications([])
        setUnreadNotificationsCount(0)
        return
      }

      setIsLoadingNotifications(true)
      try {
        // Fetch all notifications and unread count in parallel
        const [notificationsResponse, countResponse] = await Promise.all([
          getAllNotifications(),
          getUnreadNotificationCount()
        ])

        if (notificationsResponse.success) {
          console.log('Fetched notifications:', notificationsResponse.data.notifications)
          setNotifications(Array.isArray(notificationsResponse.data.notifications) ? notificationsResponse.data.notifications : [])
        }

        if (countResponse.success) {
          console.log('Unread count from API:', countResponse.data.count)
          setUnreadNotificationsCount(countResponse.data.count)
        } else {
          console.log('Count response failed, calculating from notifications array')
          // Fallback: calculate unread count from notifications array
          const unreadCount = Array.isArray(notificationsResponse.data.notifications) 
            ? notificationsResponse.data.notifications.filter(n => !n.is_read).length 
            : 0
          console.log('Calculated unread count:', unreadCount)
          setUnreadNotificationsCount(unreadCount)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        // Don't reset state on error, just log it
      } finally {
        setIsLoadingNotifications(false)
      }
    }

    fetchNotifications()
  }, [isLoggedIn])

  // Notification handlers
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await markNotificationAsRead(notificationId)
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          Array.isArray(prev) ? prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          ) : []
        )
        // Update unread count
        setUnreadNotificationsCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead()
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          Array.isArray(prev) ? prev.map(notification => ({ ...notification, is_read: true })) : []
        )
        setUnreadNotificationsCount(0)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      const response = await deleteNotification(notificationId)
      if (response.success) {
        // Update local state
        const deletedNotification = Array.isArray(notifications) ? notifications.find(n => n.id === notificationId) : null
        setNotifications(prev => Array.isArray(prev) ? prev.filter(notification => notification.id !== notificationId) : [])
        
        // Update unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadNotificationsCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Debug: Add a console log to track state changes
  useEffect(() => {
    console.log('Notification state updated:', {
      isLoggedIn,
      notificationsCount: Array.isArray(notifications) ? notifications.length : 0,
      unreadNotificationsCount,
      notifications: notifications.slice(0, 2) // Show first 2 for debugging
    })
  }, [isLoggedIn, notifications, unreadNotificationsCount])

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
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold shadow-lg border-2 border-white animate-pulse">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                  <span className="sr-only">Notifikasi</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-2">
                  <DropdownMenuLabel className="p-0">Notifikasi</DropdownMenuLabel>
                  {Array.isArray(notifications) && notifications.some(n => !n.is_read) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Tandai Semua
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                {isLoadingNotifications ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <span className="text-sm mt-2 block">Memuat notifikasi...</span>
                  </div>
                ) : Array.isArray(notifications) && notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-2 p-3 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {notification.title && (
                              <p className={cn(
                                "text-sm font-medium leading-tight", 
                                notification.is_read ? "text-gray-700" : "text-gray-900"
                              )}>
                                {notification.title}
                              </p>
                            )}
                            <p className={cn(
                              "text-sm leading-tight", 
                              notification.is_read ? "text-gray-500" : "text-gray-700"
                            )}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {formatNotificationTime(notification.created_at)}
                              </span>
                              {!notification.is_read && (
                                <span className="text-xs text-blue-600 font-medium">Baru</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(notification.id)
                                }}
                                className="h-6 w-6 p-0 hover:bg-blue-100"
                                title="Tandai sebagai dibaca"
                              >
                                <Check className="h-3 w-3 text-blue-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100"
                              title="Hapus notifikasi"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Tidak ada notifikasi</p>
                  </div>
                )}
                {Array.isArray(notifications) && notifications.length > 5 && (
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-blue-600 hover:text-blue-700">
                      Lihat semua notifikasi
                    </Button>
                  </div>
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
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold shadow-lg border-2 border-white animate-pulse">
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </span>
                )}
                <span className="sr-only">Notifikasi</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between p-2">
                <DropdownMenuLabel className="p-0">Notifikasi</DropdownMenuLabel>
                {Array.isArray(notifications) && notifications.some(n => !n.is_read) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Tandai Semua
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {isLoadingNotifications ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <span className="text-sm mt-2 block">Memuat notifikasi...</span>
                </div>
              ) : Array.isArray(notifications) && notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-2 p-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {notification.title && (
                            <p className={cn(
                              "text-sm font-medium leading-tight", 
                              notification.is_read ? "text-gray-700" : "text-gray-900"
                            )}>
                              {notification.title}
                            </p>
                          )}
                          <p className={cn(
                            "text-sm leading-tight", 
                            notification.is_read ? "text-gray-500" : "text-gray-700"
                          )}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {formatNotificationTime(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <span className="text-xs text-blue-600 font-medium">Baru</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notification.id)
                              }}
                              className="h-6 w-6 p-0 hover:bg-blue-100"
                              title="Tandai sebagai dibaca"
                            >
                              <Check className="h-3 w-3 text-blue-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNotification(notification.id)
                            }}
                            className="h-6 w-6 p-0 hover:bg-red-100"
                            title="Hapus notifikasi"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Tidak ada notifikasi</p>
                </div>
              )}
              {Array.isArray(notifications) && notifications.length > 5 && (
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-blue-600 hover:text-blue-700">
                    Lihat semua notifikasi
                  </Button>
                </div>
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
