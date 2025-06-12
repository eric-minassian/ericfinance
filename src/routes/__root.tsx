import { Toaster } from "@/components/ui/sonner";
import { DBProvider } from "@/providers/db";
import { QueryProvider } from "@/providers/query";
import { ThemeProvider } from "@/providers/theme";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <DBProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryProvider>
          <Outlet />
          <Toaster richColors />
        </QueryProvider>
      </ThemeProvider>
    </DBProvider>
  ),
});
