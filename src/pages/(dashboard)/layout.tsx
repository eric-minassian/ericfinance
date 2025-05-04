import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/side-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
