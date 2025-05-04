import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDB } from "@/hooks/db";
import { useAppForm } from "@/hooks/form";
import { accountSchema, accountsTable } from "@/lib/db/schema/account";
import { toast } from "sonner";
import { useLocation } from "wouter";

const createAccountFormSchema = accountSchema.omit({ id: true });

export function CreateAccountForm() {
  const { db } = useDB();
  const [, navigate] = useLocation();

  const form = useAppForm({
    defaultValues: {
      name: "",
    },
    validators: { onSubmit: createAccountFormSchema },
    onSubmit: async ({ value }) => {
      if (!db) {
        return navigate("/");
      }

      const [account] = await db
        .insert(accountsTable)
        .values(value)
        .returning({ id: accountsTable.id });

      if (!account) {
        toast.error("Failed to create account");
        return;
      }

      form.reset();
      toast.success("Account created successfully", {
        description: `Account ID: ${account.id}`,
        action: {
          label: "View Account",
          onClick: () => navigate(`/accounts/${account.id}`),
        },
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form.AppField
              name="name"
              children={(field) => (
                <field.FormFieldItem>
                  <field.FormFieldLabel>Name</field.FormFieldLabel>
                  <field.FormFieldControl>
                    <Input
                      placeholder="AMEX Platinum"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </field.FormFieldControl>
                  <field.FormFieldDescription>
                    This is the name of the account. It can be anything you
                    want.
                  </field.FormFieldDescription>
                  <field.FormFieldMessage />
                </field.FormFieldItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              form.reset();
              history.back();
            }}
          >
            Cancel
          </Button>
          <form.FormButton>
            {({ isSubmitting }) => (isSubmitting ? "Submitting..." : "Submit")}
          </form.FormButton>
        </div>
      </form>
    </form.AppForm>
  );
}
