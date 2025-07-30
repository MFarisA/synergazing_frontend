import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Zap, Home } from "lucide-react"
import Link from "next/link"

export default function CreateProjectLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">Synergazing</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-gray-500" />
                <span className="text-gray-400">/</span>
                <span className="text-gray-800 font-medium">Buat Proyek Baru</span>
              </div>
            </div>

            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-gradient-to-b from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-bold">Buat Proyek</span>
                    </div>

                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div key={step} className="flex items-center gap-3 p-3 rounded-lg">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="h-4 flex-1" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="w-full h-2 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8">
                  <div className="mb-8">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>

                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <Skeleton className="h-5 w-24 mb-2" />
                              <Skeleton className="h-4 w-full" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-32 w-full" />
                    </div>

                    <div>
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-12 pt-8 border-t">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
