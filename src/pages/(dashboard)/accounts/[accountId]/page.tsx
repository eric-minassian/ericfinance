import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { Link } from "wouter";

interface AccountPageProps {
  params: {
    accountId: string;
  };
}

export default function AccountPage({ params }: AccountPageProps) {
  return (
    <ContentLayout
      header={
        <Header
          description="View and manage your account."
          actions={
            <Button asChild>
              <Link href={`/accounts/${params.accountId}/transactions`}>
                View Transactions
              </Link>
            </Button>
          }
        >
          Account Details
        </Header>
      }
    />
  );
}
