import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDB } from "@/hooks/db";
import { useAppForm } from "@/hooks/form";
import {
  Transaction,
  transactionFormSchema,
  transactionsTable,
} from "@/lib/db/schema/transactions";
import { applyRules } from "@/lib/services/rules/apply-rules";
import { toast } from "sonner";
import { useLocation } from "wouter";

const createTransactionFormSchema = transactionFormSchema.omit({
  id: true,
  accountId: true,
  importId: true,
});

interface CreateTransactionFormProps {
  accountId: Transaction["accountId"];
}

export function CreateTransactionForm({
  accountId,
}: CreateTransactionFormProps) {
  const { db } = useDB();
  const [, navigate] = useLocation();

  const form = useAppForm({
    defaultValues: {
      amount: "",
      date: "",
      payee: "",
      notes: "",
    },
    validators: { onSubmit: createTransactionFormSchema },
    onSubmit: async ({ value }) => {
      const parsedValue = createTransactionFormSchema.parse(value);

      if (!accountId) {
        toast.error("Account ID is required");
        return;
      }

      if (!db) {
        return navigate("/");
      }

      try {
        const [newTransaction] = await db
          .insert(transactionsTable)
          .values({
            ...parsedValue,
            accountId,
          })
          .returning({ id: transactionsTable.id });

        if (newTransaction.id) {
          await applyRules({ db, transactionIds: [newTransaction.id] });
        }
      } catch (error) {
        console.error("Error creating transaction:", error);
        toast.error("Failed to create transaction");
        return;
      }

      form.reset();
      toast.success("Transaction created successfully");
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
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField
              name="amount"
              children={(field) => (
                <field.FormFieldItem>
                  <field.FormFieldLabel>Amount</field.FormFieldLabel>
                  <field.FormFieldControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </field.FormFieldControl>
                  <field.FormFieldDescription>
                    This is the amount of the transaction.
                  </field.FormFieldDescription>
                  <field.FormFieldMessage />
                </field.FormFieldItem>
              )}
            />
            <form.AppField
              name="date"
              children={(field) => (
                <field.FormFieldItem>
                  <field.FormFieldLabel>Date</field.FormFieldLabel>
                  <field.FormFieldControl>
                    <Input
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </field.FormFieldControl>
                  <field.FormFieldDescription>
                    This is the date of the transaction.
                  </field.FormFieldDescription>
                  <field.FormFieldMessage />
                </field.FormFieldItem>
              )}
            />
            <form.AppField
              name="payee"
              children={(field) => (
                <field.FormFieldItem>
                  <field.FormFieldLabel>Payee</field.FormFieldLabel>
                  <field.FormFieldControl>
                    <Input
                      type="text"
                      placeholder="Payee Name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </field.FormFieldControl>
                  <field.FormFieldDescription>
                    This is the payee of the transaction.
                  </field.FormFieldDescription>
                  <field.FormFieldMessage />
                </field.FormFieldItem>
              )}
            />
            <form.AppField
              name="notes"
              children={(field) => (
                <field.FormFieldItem>
                  <field.FormFieldLabel>Notes</field.FormFieldLabel>
                  <field.FormFieldControl>
                    <Input
                      type="text"
                      placeholder="Notes"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </field.FormFieldControl>
                  <field.FormFieldDescription>
                    This is the notes for the transaction.
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
