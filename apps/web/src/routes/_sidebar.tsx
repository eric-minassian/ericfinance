import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useDB } from "@/hooks/db";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar")({
  component: RouteComponent,
});

function RouteComponent() {
  const { db } = useDB();
  const { authStatus } = useAuthenticator((c) => [c.authStatus]);

  if (!db) {
    if (authStatus === "authenticated") {
      return <Navigate to="/portfolio-select" />;
    }
    return <Navigate to="/" />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
