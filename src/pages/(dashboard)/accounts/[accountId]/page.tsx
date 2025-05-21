import { TransactionsTable } from "@/components/transactions-table";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { useDB } from "@/hooks/db";
import { getAccount } from "@/lib/services/accounts/get-account";
import { useQuery } from "@tanstack/react-query";
import { NetWorthChart } from "../_components/net-worth-chart";
import { EditAccountDropdown } from "./_components/edit-account-dropdown";

interface AccountPageProps {
  params: {
    accountId: string;
  };
}

export default function AccountPage({ params }: AccountPageProps) {
  const { db } = useDB();
  const { data } = useQuery({
    queryKey: ["getAccount", params.accountId],
    queryFn: () => getAccount({ db: db!, accountId: params.accountId }),
  });

  return (
    <ContentLayout
      header={
        <Header actions={<EditAccountDropdown accountId={params.accountId} />}>
          Account {data?.name}
        </Header>
      }
    >
      <NetWorthChart accountId={params.accountId} />
      <TransactionsTable accountId={params.accountId} />
    </ContentLayout>
  );
}
