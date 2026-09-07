export default function DashSectionLoading() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-40 rounded-xl bg-muted/40" />
      ))}
    </div>
  );
}