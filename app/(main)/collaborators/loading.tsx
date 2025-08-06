import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CollaboratorsLoading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Skeleton */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Search Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Skills Filter Card Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Skeleton */}
        <main className="lg:col-span-3 space-y-6">
          {/* Header Skeleton */}
          <Skeleton className="h-7 w-48" />

          {/* Collaborator Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6 flex flex-col items-center text-center h-full">
                  {/* Avatar Skeleton */}
                  <Skeleton className="h-24 w-24 rounded-full mb-4" />
                  
                  {/* Name Skeleton */}
                  <Skeleton className="h-6 w-32 mb-2" />
                  
                  {/* Title Skeleton */}
                  <Skeleton className="h-4 w-28 mb-2" />
                  
                  {/* Location Skeleton */}
                  <div className="flex items-center gap-1 mb-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  
                  {/* Skills Badges Skeleton */}
                  <div className="flex flex-wrap justify-center gap-1 mb-4">
                    {Array.from({ length: 4 }).map((_, skillIndex) => (
                      <Skeleton key={skillIndex} className="h-5 w-16 rounded-full" />
                    ))}
                  </div>
                  
                  {/* Bio Skeleton */}
                  <div className="space-y-2 mb-4 w-full">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  
                  {/* Action Buttons Skeleton */}
                  <div className="flex gap-2 w-full mt-auto">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

// Add default export for Next.js loading convention
export default CollaboratorsLoading;
