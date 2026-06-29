export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="post-feed">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card"
        >
          <div className="skeleton-line h-3 w-16" />
          <div className="skeleton-line h-5 w-3/4" />
          <div className="skeleton-line h-4 w-full" />
          <div className="skeleton-line h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
