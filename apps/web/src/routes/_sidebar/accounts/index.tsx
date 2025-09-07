import { createFileRoute } from "@tanstack/react-router"
import { NetWorthChart } from "@/components/net-worth-chart";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { AccountsList } from "@/routes/_sidebar/accounts/-components/accounts-list";
import { CreateAccountButton } from "@/routes/_sidebar/accounts/-components/create-account-button";

export const Route = createFileRoute("/_sidebar/accounts/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ContentLayout
      header={<Header actions={<CreateAccountButton />}>Accounts</Header>}
    >
      <NetWorthChart />
      <AccountsList />
    </ContentLayout>
  );
}
