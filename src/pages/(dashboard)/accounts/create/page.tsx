import { CreateAccountForm } from "@/components/forms/accounts/create-account-form";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";

export default function CreateAccountPage() {
  return (
    <ContentLayout
      header={
        <Header description="Create a new account.">Create Account</Header>
      }
    >
      <CreateAccountForm />
    </ContentLayout>
  );
}
