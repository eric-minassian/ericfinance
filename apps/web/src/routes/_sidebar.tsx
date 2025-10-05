import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useDB } from "@/hooks/db";
import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

const getSidebarState = () => {
  if (typeof document === "undefined") return false;
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith("sidebar_state="))
    ?.split("=")[1];
  return value === "true";
};

export const Route = createFileRoute("/_sidebar")({
  component: RouteComponent,
});

function RouteComponent() {
  const defaultOpen = useMemo(getSidebarState, []);
  const { db } = useDB();

  if (!db) {
    return <Navigate to="/" />;
  }

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
