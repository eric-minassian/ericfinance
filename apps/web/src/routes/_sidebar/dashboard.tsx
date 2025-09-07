import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_sidebar/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ContentLayout header={<Header>Dashboard</Header>}></ContentLayout>;
}
