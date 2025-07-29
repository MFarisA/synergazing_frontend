import { Skeleton } from "@/components/ui/skeleton"

export default function CollaboratorsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white border-b py-4 mb-6 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Skeleton */}
        <aside className="lg:col-span-1 space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </aside>

        {/* Main Content Skeleton */}
        <main className="lg:col-span-3 space-y-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4 flex flex-col items-center text-center"
              >
                <Skeleton className="h-24 w-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex flex-wrap justify-center gap-1 mb-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex gap-2 w-full">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
