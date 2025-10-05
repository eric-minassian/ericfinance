import { ContentLayout } from "@/components/layout/content-layout";
import { SiteHeader } from "@/components/layout/site-header";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_sidebar/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ContentLayout header={<SiteHeader>Dashboard</SiteHeader>}></ContentLayout>
  );
}
