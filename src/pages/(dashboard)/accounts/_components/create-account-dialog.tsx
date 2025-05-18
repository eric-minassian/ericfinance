import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDB } from "@/hooks/db";
import { useAppForm } from "@/hooks/form";
import { createAccount } from "@/lib/services/accounts/create-account";
import { useCallback } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { z } from "zod";

const createAccountFormValidator = z.object({
  name: z.string().min(1, "Account name is required"),
});

export function CreateAccountDialog() {
  const { db } = useDB();
  const [, navigate] = useLocation();

  const form = useAppForm({
    validators: { onSubmit: createAccountFormValidator },
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const { id } = await createAccount({ db: db!, name: value.name });
        navigate(`/accounts/${id}`);
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to create account. Check the console for more details."
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
        <DialogTitle>Add Account</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <form.AppForm>
        <form onSubmit={handleSubmit} className="space-y-4">
          <form.AppField
            name="name"
            children={(field) => (
              <field.FormFieldItem>
                <field.FormFieldLabel>Name</field.FormFieldLabel>
                <field.FormFieldControl>
                  <Input
                    placeholder="My Account"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </field.FormFieldControl>
                <field.FormFieldMessage />
              </field.FormFieldItem>
            )}
          />
          <DialogFooter>
            <Button type="submit">Create Account</Button>
          </DialogFooter>
        </form>
      </form.AppForm>
    </DialogContent>
  );
}
