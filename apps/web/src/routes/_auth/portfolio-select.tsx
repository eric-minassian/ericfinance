import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { useRuntimeConfig } from "@/hooks/runtime-config";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { fetchAuthSession, signOut } from "aws-amplify/auth";

export const Route = createFileRoute("/_auth/portfolio-select")({
  component: RouteComponent,
});

function RouteComponent() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const { config } = useRuntimeConfig();

  if (authStatus !== "authenticated") {
    return <Navigate to="/login" />;
  }

  async function handleGetPortfolio() {
    const baseUrl = config?.portfolioApiUrl;
    if (!baseUrl) return;
    const url = `${baseUrl}/portfolio`;

    try {
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error! status: ${response.status} body: ${text}`);
      }

      const result = await response.json();
      console.log("Portfolio response:", result);
    } catch (error) {
      if (error instanceof Error) {
        console.log("error message: ", error.message);
      } else {
        console.log("unexpected error: ", error);
      }
    }
  }

  return (
    <ContentLayout header={<Header>Portfolio Select</Header>}>
      <Button onClick={handleGetPortfolio}>Get Portfolio</Button>
      <Button
        onClick={async () => {
          await signOut();
        }}
      >
        Sign Out
      </Button>
    </ContentLayout>
  );
}
