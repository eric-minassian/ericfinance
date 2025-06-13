import { NetWorthChart } from "@/components/net-worth-chart";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { AccountsList } from "@/pages/(dashboard)/accounts/_components/accounts-list";
import { CreateAccountButton } from "@/pages/(dashboard)/accounts/_components/create-account-button";

export const Route = createFileRoute({
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
