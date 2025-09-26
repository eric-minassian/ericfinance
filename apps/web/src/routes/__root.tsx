import { Toaster } from "@/components/ui/sonner";
import { useRuntimeConfig } from "@/hooks/runtime-config";
import { DBProvider } from "@/providers/db";
import { QueryProvider } from "@/providers/query";
import { ThemeProvider } from "@/providers/theme";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Amplify } from "aws-amplify";

function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const { data: config, isPending, error } = useRuntimeConfig();
  if (isPending) return null;
  if (error) {
    console.error("Failed to load runtime config", error);
    return null;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolClientId: config.userPoolClientId,
        userPoolId: config.userPoolId,
      },
    },
  });

  return <>{children}</>;
}

export const Route = createRootRoute({
  component: () => (
    <QueryProvider>
      <AmplifyProvider>
        <DBProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Outlet />
            <Toaster richColors />
          </ThemeProvider>
        </DBProvider>
      </AmplifyProvider>
    </QueryProvider>
  ),
});
