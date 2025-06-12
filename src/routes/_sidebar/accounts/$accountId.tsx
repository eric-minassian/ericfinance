import { createFileRoute } from "@tanstack/react-router"
import { NetWorthChart } from "@/components/net-worth-chart";
import { TransactionsTable } from "@/components/transactions-table";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { useDB } from "@/hooks/db";
import { getAccount } from "@/lib/services/accounts/get-account";
import { EditAccountDropdown } from "@/routes/_sidebar/accounts/-components/edit-account-dropdown";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_sidebar/accounts/$accountId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { accountId } = Route.useParams();
  const { db } = useDB();
  const { data } = useQuery({
    queryKey: ["getAccount", accountId],
    queryFn: () => getAccount({ db: db!, accountId }),
  });

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
