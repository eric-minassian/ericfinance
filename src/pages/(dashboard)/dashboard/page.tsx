export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 p-4 flex-1">
      <div className="grid gap-4 md:grid-cols-3 auto-rows-min">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="rounded-xl bg-muted/50 flex-1 md:min-h-min min-h-[50vh]" />
    </div>
  );
}
