/** Skeleton placeholder for a property card while listings are loading. */
export function PropertyCardSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
      <div className="mt-3 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

/** A responsive grid of card skeletons. */
export function PropertyGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
