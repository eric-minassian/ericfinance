import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useDB } from "@/hooks/db";
import { Redirect } from "wouter";

export default function DashboardLayout({ children }: React.PropsWithChildren) {
  const { db } = useDB();

  if (!db) {
    return <Redirect to="/" />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-4 shrink-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <ModeToggle />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
