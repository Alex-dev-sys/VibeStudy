import { Skeleton } from '@/components/ui/skeleton';

export function EditorSkeleton() {
  return (
    <div className="flex h-[500px] flex-col gap-3 rounded-2xl border border-white/10 bg-black/60 p-4">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between">
        <Skeleton width="120px" height="20px" />
        <div className="flex gap-2">
          <Skeleton width="80px" height="32px" />
          <Skeleton width="80px" height="32px" />
        </div>
      </div>

      {/* Line numbers and code area */}
      <div className="flex flex-1 gap-4">
        {/* Line numbers */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} width="30px" height="20px" />
          ))}
        </div>

        {/* Code lines */}
        <div className="flex-1 space-y-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton
              key={i}
              width={`${Math.random() * 40 + 40}%`}
              height="20px"
            />
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <Skeleton width="100px" height="16px" />
        <Skeleton width="150px" height="16px" />
      </div>
    </div>
  );
}
