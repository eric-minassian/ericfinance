import { Toaster } from "@/components/ui/sonner";
import { DBProvider } from "@/providers/db";
import { PortfolioSyncProvider } from "@/providers/portfolio-sync";
import { QueryProvider } from "@/providers/query";
import { ThemeProvider } from "@/providers/theme";
import { Authenticator } from "@aws-amplify/ui-react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
    },
  },
});

export const Route = createRootRoute({
  component: () => (
    <Authenticator.Provider>
      <DBProvider>
        <PortfolioSyncProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <QueryProvider>
              <Outlet />
              <Toaster richColors />
            </QueryProvider>
          </ThemeProvider>
        </PortfolioSyncProvider>
      </DBProvider>
    </Authenticator.Provider>
  ),
});
