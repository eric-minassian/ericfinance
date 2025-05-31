import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppForm } from "@/hooks/form";
import { useCallback } from "react";
import { z } from "zod";

const passwordFormValidator = z
  .object({
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword && confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isNewPassword?: boolean;
  onSubmit: (password: string) => Promise<void>;
}

export function PasswordDialog({
  open,
  onOpenChange,
  title,
  description,
  isNewPassword = false,
  onSubmit,
}: PasswordDialogProps) {
  const form = useAppForm({
    validators: { onSubmit: passwordFormValidator },
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onSubmit(value.password);
        handleCancel();
      } catch (error) {
        console.error(error);
        formApi.setErrorMap({
          onSubmit: {
            fields: {
              password: {
                message: "Incorrect password",
              },
            },
          },
        });
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

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form onSubmit={handleSubmit} className="space-y-4">
            <form.AppField
              name="password"
              children={(field) => (
                <field.FormFieldItem>
                  <field.FormFieldLabel>Password</field.FormFieldLabel>
                  <field.FormFieldControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </field.FormFieldControl>
                  <field.FormFieldMessage />
                </field.FormFieldItem>
              )}
            />

            {isNewPassword && (
              <form.AppField
                name="confirmPassword"
                children={(field) => (
                  <field.FormFieldItem>
                    <field.FormFieldLabel>
                      Confirm Password
                    </field.FormFieldLabel>
                    <field.FormFieldControl>
                      <Input
                        placeholder="Confirm your password"
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </field.FormFieldControl>
                    <field.FormFieldMessage />
                  </field.FormFieldItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {isNewPassword ? "Create" : "Unlock"}
              </Button>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

interface SimplePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  type: "create" | "unlock" | "change" | "addEncryption";
}

export function SimplePasswordDialog({
  isOpen,
  onClose,
  onSubmit,
  type,
}: SimplePasswordDialogProps) {
  const title =
    type === "create"
      ? "Create Encrypted Database"
      : type === "change"
      ? "Change Database Password"
      : type === "addEncryption"
      ? "Add Encryption to Database"
      : "Unlock Database";
  const description =
    type === "create"
      ? "Create a password for your new encrypted database. This password will be required to access your data."
      : type === "change"
      ? "Enter a new password for your encrypted database. This will replace your current password."
      : type === "addEncryption"
      ? "Add encryption to your current database. Enter a password that will be required to access your data."
      : "Enter the password to unlock your encrypted database.";

  return (
    <PasswordDialog
      open={isOpen}
      onOpenChange={onClose}
      title={title}
      description={description}
      isNewPassword={
        type === "create" || type === "change" || type === "addEncryption"
      }
      onSubmit={onSubmit}
    />
  );
}
