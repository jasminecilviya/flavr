export default function SkeletonCard() {
  return (
    <div className="card-flavr overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-1/2 skeleton" />
        <div className="flex justify-between items-center">
          <div className="h-6 w-16 skeleton" />
          <div className="h-8 w-16 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}
