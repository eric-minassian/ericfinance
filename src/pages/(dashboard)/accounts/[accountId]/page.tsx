import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { SpaceBetween } from "@/components/ui/space-between";
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
            <SpaceBetween>
              <Button asChild>
                <Link href={`/accounts/${params.accountId}/transactions`}>
                  View Transactions
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/accounts/${params.accountId}/securities`}>
                  View Securities
                </Link>
              </Button>
            </SpaceBetween>
          }
        >
          Account Details
        </Header>
      }
    />
  );
}
