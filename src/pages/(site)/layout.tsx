import { ModeToggle } from "@/components/mode-toggle";

export default function SiteLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="relative min-h-svh w-full">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      {children}
    </div>
  );
}
