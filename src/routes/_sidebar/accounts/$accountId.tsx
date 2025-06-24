import { createFileRoute } from "@tanstack/react-router"
import { NetWorthChart } from "@/components/net-worth-chart";
import { TransactionsTable } from "@/components/transactions-table";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { useGetAccount } from "@/lib/services/accounts/use-get-account";
import { EditAccountDropdown } from "@/routes/_sidebar/accounts/-components/edit-account-dropdown";

export const Route = createFileRoute("/_sidebar/accounts/$accountId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { accountId } = Route.useParams();
  const { data } = useGetAccount({ accountId });

  return (
    <ContentLayout
      header={
        <Header
          actions={
            <EditAccountDropdown
              accountId={accountId}
              accountVariant={data?.variant ?? "transactions"}
            />
          }
        >
          Account {data?.name}
        </Header>
      }
    >
      <NetWorthChart accountId={accountId} />
      <TransactionsTable accountId={accountId} />
    </ContentLayout>
  );
}
