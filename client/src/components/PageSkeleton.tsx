type PageSkeletonProps = {
  cardCount?: number;
};

export default function PageSkeleton({ cardCount = 4 }: PageSkeletonProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="h-6 w-1/2 rounded-full bg-slate-200 animate-pulse" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="h-24 rounded-[1.5rem] bg-slate-200 animate-pulse" />
          <div className="h-24 rounded-[1.5rem] bg-slate-200 animate-pulse" />
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-[24px] bg-slate-200 animate-pulse"
          />
        ))}
      </section>
    </div>
  );
}
