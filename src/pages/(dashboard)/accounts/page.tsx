import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { AccountsList } from "./_components/accounts-list";
import { CreateAccountButton } from "./_components/create-account-button";
import { NetWorthChart } from "./_components/net-worth-chart";

export default function AccountsPage() {
  return (
    <ContentLayout
      header={<Header actions={<CreateAccountButton />}>Accounts</Header>}
    >
      <NetWorthChart />
      <AccountsList />
    </ContentLayout>
  );
}
