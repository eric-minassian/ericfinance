import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useDB } from "@/hooks/db";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/_sidebar")({
  component: RouteComponent,
});

function RouteComponent() {
  const { db, createEmptyDB } = useDB();
  const { authStatus } = useAuthenticator((c) => [c.authStatus]);
  const creatingRef = useRef(false);

  // If authenticated but no local DB yet (e.g., hard refresh after prior login),
  // create an empty one to satisfy the sidebar layout instead of redirecting back to root.
  useEffect(() => {
    if (!db && authStatus === "authenticated" && !creatingRef.current) {
      creatingRef.current = true;
      (async () => {
        try {
          await createEmptyDB?.();
        } finally {
          creatingRef.current = false; // allow retry if it somehow failed silently
        }
      })();
    }
  }, [db, authStatus, createEmptyDB]);

  if (!db) {
    if (authStatus === "authenticated") {
      return (
        <div className="min-h-svh flex items-center justify-center text-sm text-muted-foreground">
          Preparing your portfolio...
        </div>
      );
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
