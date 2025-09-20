import { Toaster } from "@/components/ui/sonner";
import { useRuntimeConfig } from "@/hooks/runtime-config";
import { DBProvider } from "@/providers/db";
import { QueryProvider } from "@/providers/query";
import { RuntimeConfigProvider } from "@/providers/runtime-config";
import { ThemeProvider } from "@/providers/theme";
import { Authenticator } from "@aws-amplify/ui-react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Amplify } from "aws-amplify";

function AmplifyConfigurator() {
  const { config, loading, error } = useRuntimeConfig();
  if (loading) return null;
  if (error) {
    console.error("Failed to load runtime config", error);
    return null;
  }
  if (config) {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolClientId: config.userPoolClientId,
          userPoolId: config.userPoolId,
        },
      },
    });
  }
  return null;
}

export const Route = createRootRoute({
  component: () => (
    <QueryProvider>
      <RuntimeConfigProvider>
        <AmplifyConfigurator />
        <Authenticator.Provider>
          <DBProvider>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
              <Outlet />
              <Toaster richColors />
            </ThemeProvider>
          </DBProvider>
        </Authenticator.Provider>
      </RuntimeConfigProvider>
    </QueryProvider>
  ),
});
