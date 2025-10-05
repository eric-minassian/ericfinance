import { ContentLayout } from "@/components/layout/content-layout";
import { SiteHeader } from "@/components/layout/site-header";
import { NetWorthChart } from "@/components/net-worth-chart";
import { TransactionsTable } from "@/components/transactions-table";
import { useGetAccount } from "@/lib/services/accounts/get-account";
import { EditAccountDropdown } from "@/routes/_sidebar/accounts/-components/edit-account-dropdown";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/accounts/$accountId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { accountId } = Route.useParams();
  const { data } = useGetAccount({ accountId });

  return (
    <ContentLayout
      header={
        <SiteHeader
          actions={
            <EditAccountDropdown
              accountId={accountId}
              accountVariant={data?.variant ?? "transactions"}
            />
          }
        >
          Account {data?.name}
        </SiteHeader>
      }
    >
      <NetWorthChart accountId={accountId} />
      <TransactionsTable accountId={accountId} />
    </ContentLayout>
  );
}
