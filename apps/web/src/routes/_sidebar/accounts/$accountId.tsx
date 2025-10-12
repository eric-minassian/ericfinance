import { SiteHeader } from "@/components/layout/site-header";
import { TransactionsTable } from "@/components/transactions-table";
import { useGetAccount } from "@/lib/services/accounts/get-account";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/accounts/$accountId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { accountId } = Route.useParams();
  const { data } = useGetAccount({ accountId });

  return (
    <div className="flex flex-col h-screen">
      <SiteHeader>Account {data?.name}</SiteHeader>

      <div className="flex-1 overflow-hidden px-4 lg:px-6 flex flex-col">
        <TransactionsTable accountId={accountId} />
      </div>
    </div>
  );
}
