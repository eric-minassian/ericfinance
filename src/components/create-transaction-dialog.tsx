import { useAppForm } from "@/hooks/form";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { useCreateTransactions } from "@/lib/services/transactions/create-transactions";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { DatePicker } from "./date-picker";
import Icon from "./icon";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

const createTransactionFormValidator = z.object({
  amount: z.number().min(0, "Amount must be a positive number"),
  date: z.string().min(1, "Date is required"),
  payee: z.string().min(1, "Payee is required"),
});

interface CreateTransactionDialogProps {
  onOpenChange: (open: boolean) => void;
  accountId: Account["id"];
}

function CreateTransactionDialog({
  onOpenChange,
  accountId,
}: CreateTransactionDialogProps) {
  const createTransactionMutation = useCreateTransactions();

  const form = useAppForm({
    validators: { onSubmit: createTransactionFormValidator },
    defaultValues: {
      amount: 0,
      date: DateString.fromString(new Date().toISOString()).toISOString(),
      payee: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const parsedValue = createTransactionFormValidator.parse(value);
        await createTransactionMutation.mutateAsync([
          {
            accountId,
            date: DateString.fromString(parsedValue.date),
            amount: parsedValue.amount * 100, // Convert to cents
            payee: parsedValue.payee,
          },
        ]);
        form.reset();
        onOpenChange(false);
        toast.success("Transaction created successfully");
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to create transaction. Check the console for more details."
        );
      }
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Transaction</DialogTitle>
        <DialogDescription />
      </DialogHeader>

      <form.AppForm>
        <form onSubmit={handleSubmit} className="space-y-4">
          <form.AppField
            name="date"
            children={(field) => (
              <field.FormFieldItem>
                <field.FormFieldLabel>Date</field.FormFieldLabel>
                <field.FormFieldControl>
                  <DatePicker
                    value={DateString.fromString(field.state.value)}
                    onChange={(e) => field.handleChange(e?.toISOString() || "")}
                  />
                </field.FormFieldControl>
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
                    placeholder="Payee Name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </field.FormFieldControl>
                <field.FormFieldMessage />
              </field.FormFieldItem>
            )}
          />
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
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                  />
                </field.FormFieldControl>
                <field.FormFieldMessage />
              </field.FormFieldItem>
            )}
          />
          <DialogFooter>
            <Button type="submit">Create Transaction</Button>
          </DialogFooter>
        </form>
      </form.AppForm>
    </DialogContent>
  );
}

export function CreateTransactionButton({
  accountId,
}: {
  accountId: Account["id"];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon variant="plus" />
          Create Transaction
        </Button>
      </DialogTrigger>

      <CreateTransactionDialog onOpenChange={setOpen} accountId={accountId} />
    </Dialog>
  );
}
