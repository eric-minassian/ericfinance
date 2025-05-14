import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { Link } from "wouter";
import CreateSecurityForm from "./create-security-form";

interface CreateSecurityPageProps {
  params: {
    accountId: string;
  };
}

export default function CreateSecurityPage({
  params,
}: CreateSecurityPageProps) {
  return (
    <ContentLayout
      header={
        <Header
          description="Create a new security."
          actions={
            <Button asChild>
              <Link href={`/accounts/${params.accountId}/securities`}>
                Back to Securities
              </Link>
            </Button>
          }
        >
          Create Security
        </Header>
      }
    >
      <CreateSecurityForm accountId={params.accountId} />
    </ContentLayout>
  );
}
