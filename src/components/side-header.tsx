import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";

export function SiteHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4 shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
      </div>
      <ModeToggle />
    </header>
  );
}
