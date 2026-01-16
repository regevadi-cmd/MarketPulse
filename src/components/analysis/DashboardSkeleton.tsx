import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64 bg-zinc-800" />
        <Skeleton className="h-8 w-24 bg-zinc-800" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Large card - 2 col */}
        <div className="xl:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <Skeleton className="h-6 w-40 mb-4 bg-zinc-800" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full bg-zinc-800" />
            <Skeleton className="h-4 w-5/6 bg-zinc-800" />
            <Skeleton className="h-4 w-4/6 bg-zinc-800" />
          </div>
        </div>

        {/* Regular cards */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <Skeleton className="h-6 w-32 mb-4 bg-zinc-800" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-zinc-800" />
              <Skeleton className="h-4 w-3/4 bg-zinc-800" />
              <Skeleton className="h-4 w-1/2 bg-zinc-800" />
            </div>
          </div>
        ))}

        {/* Full width card */}
        <div className="xl:col-span-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <Skeleton className="h-6 w-48 mb-4 bg-zinc-800" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
