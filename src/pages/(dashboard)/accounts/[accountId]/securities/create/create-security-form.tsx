import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDB } from "@/hooks/db";
import { useAppForm } from "@/hooks/form";
import { securitiesTable } from "@/lib/db/schema/securities";
import { toast } from "sonner";
import { z } from "zod";

interface CreateSecurityFormProps {
  accountId: string;
}

const createSecurityFormValidator = z.object({
  date: z
    .string()
    .date()
    .transform((val) => {
      const parsed = new Date(val);
      if (isNaN(parsed.getTime())) {
        throw new Error("Invalid date");
      }
      return parsed;
    }),
  ticker: z.string().min(1),
  amount: z.string().transform((val) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) {
      throw new Error("Invalid amount");
    }
    return parsed;
  }),
});

export default function CreateSecurityForm({
  accountId,
}: CreateSecurityFormProps) {
  const { db } = useDB();

  const form = useAppForm({
    defaultValues: {
      date: "",
      ticker: "",
      amount: "",
    },
    validators: { onSubmit: createSecurityFormValidator },
    onSubmit: async ({ value }) => {
      const parsedValue = createSecurityFormValidator.parse(value);

      if (!db) {
        return;
      }

      try {
        await db.insert(securitiesTable).values({
          ...parsedValue,
          accountId,
        });
      } catch (error) {
        console.error("Error creating security:", error);
        toast.error("Failed to create security");
        return;
      }

      form.reset();
      toast.success("Security created successfully");
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
            <CardTitle>Security Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <field.FormFieldMessage />
                </field.FormFieldItem>
              )}
            />
            <form.AppField
              name="ticker"
              children={(field) => (
                <field.FormFieldItem>
                  <field.FormFieldLabel>Ticker</field.FormFieldLabel>
                  <field.FormFieldControl>
                    <Input
                      type="text"
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
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </field.FormFieldControl>
                  <field.FormFieldMessage />
                </field.FormFieldItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end space-x-2">
          <form.FormButton>
            {({ isSubmitting }) => (isSubmitting ? "Submitting..." : "Submit")}
          </form.FormButton>
        </div>
      </form>
    </form.AppForm>
  );
}
