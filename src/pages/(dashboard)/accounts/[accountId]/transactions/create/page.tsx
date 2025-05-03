import { CreateTransactionForm } from "@/components/forms/transactions/create-transaction-form";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";

interface CreateTransactionPageProps {
  params: {
    accountId: string;
  };
}

export default function CreateTransactionPage({
  params,
}: CreateTransactionPageProps) {
  return (
    <ContentLayout
      header={
        <Header description="Create a new transaction.">
          Create Transaction
        </Header>
      }
    >
      <CreateTransactionForm accountId={params.accountId} />
    </ContentLayout>
  );
}
