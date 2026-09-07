export default function RootLoading() {
  return (
    <div className="flex-col-center h-screen bg-background gap-3">
      <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Loading
      </span>
    </div>
  );
}