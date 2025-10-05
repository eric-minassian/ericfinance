import { ContentLayout } from "@/components/layout/content-layout";
import { SiteHeader } from "@/components/layout/site-header";
import { NetWorthChart } from "@/components/net-worth-chart";
import { AccountsList } from "@/routes/_sidebar/accounts/-components/accounts-list";
import { CreateAccountButton } from "@/routes/_sidebar/accounts/-components/create-account-button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/accounts/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ContentLayout
      header={
        <SiteHeader actions={<CreateAccountButton />}>Accounts</SiteHeader>
      }
    >
      <NetWorthChart />
      <AccountsList />
    </ContentLayout>
  );
}
