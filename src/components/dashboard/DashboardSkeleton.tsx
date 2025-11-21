import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton width="200px" height="32px" />
        <Skeleton width="300px" height="20px" />
      </div>

      {/* Language selector */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} width="100px" height="40px" />
        ))}
      </div>

      {/* Day selector */}
      <Skeleton width="100%" height="60px" />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theory section */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <Skeleton width="150px" height="24px" />
          <SkeletonText lines={8} />
        </div>

        {/* Tasks section */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <Skeleton width="120px" height="24px" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton variant="circular" width="24px" height="24px" />
              <div className="flex-1 space-y-2">
                <Skeleton width="100%" height="20px" />
                <Skeleton width="80%" height="16px" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code editor */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <Skeleton width="150px" height="24px" className="mb-4" />
        <Skeleton width="100%" height="400px" />
      </div>
    </div>
  );
}
