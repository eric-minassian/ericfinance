import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppForm } from "@/hooks/form";
import { useCreateAccount } from "@/lib/services/accounts/create-account";
import { useCallback } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { z } from "zod";

const createAccountFormValidator = z.object({
  name: z.string().min(1, "Account name is required"),
  variant: z.enum(["transactions", "securities"], {
    errorMap: () => ({ message: "Invalid account variant" }),
  }),
});

interface CreateAccountDialogProps {
  onOpenChange: (open: boolean) => void;
}

export function CreateAccountDialog({
  onOpenChange,
}: CreateAccountDialogProps) {
  const [, navigate] = useLocation();
  const createAccountMutation = useCreateAccount();

  const form = useAppForm({
    validators: { onSubmit: createAccountFormValidator },
    defaultValues: {
      name: "",
      variant: "transactions",
    },
    onSubmit: async ({ value }) => {
      try {
        const parsedValue = createAccountFormValidator.parse(value);
        const { id } = await createAccountMutation.mutateAsync({
          ...parsedValue,
        });
        form.reset();
        onOpenChange(false);
        toast.success("Account created successfully", {
          action: {
            label: "View Account",
            onClick: () => navigate(`/accounts/${id}`),
          },
        });
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
          <form.AppField
            name="variant"
            children={(field) => (
              <field.FormFieldItem>
                <field.FormFieldLabel>Variant</field.FormFieldLabel>
                <field.FormFieldControl>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {["transactions", "securities"].map((variant) => (
                        <SelectItem key={variant} value={variant}>
                          {variant.charAt(0).toUpperCase() + variant.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
