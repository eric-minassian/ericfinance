import { Navigate, createFileRoute } from "@tanstack/react-router";

// Alias route so that external redirects to "/dashboard" resolve correctly.
// The real dashboard UI lives under the nested layout route `/_sidebar/dashboard`.
export const Route = createFileRoute("/dashboard")({
  component: () => <Navigate to="/_sidebar/dashboard" />,
});
