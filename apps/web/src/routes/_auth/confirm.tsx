import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth";
import { useAppForm } from "@/hooks/form";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { confirmSignUp } from "aws-amplify/auth";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
  email: z.email().optional(),
});

const verifySchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

export const Route = createFileRoute("/_auth/confirm")({
  validateSearch: (search) => searchSchema.parse(search),
  component: ConfirmRoute,
});

function ConfirmRoute() {
  const navigate = useNavigate();
  const auth = useAuth();

  const search = Route.useSearch();
  const email = search.email?.trim();

  const form = useAppForm({
    validators: { onSubmit: verifySchema },
    defaultValues: { code: "" },
    onSubmit: async ({ value, formApi }) => {
      if (!email) {
        toast.error("Missing email for confirmation. Start over.");
        navigate({ to: "/signup", replace: true });
        return;
      }

      try {
        const { code } = verifySchema.parse(value);
        await confirmSignUp({
          username: email,
          confirmationCode: code,
        });

        toast.success("Email verified.", {
          description: "Your email is verified. Sign in to continue.",
        });
        navigate({ to: "/login" });
      } catch (err: unknown) {
        formApi.setErrorMap({
          onSubmit: { fields: { code: { message: "Invalid code" } } },
        });
        toast.error(err instanceof Error ? err.message : "Verification failed");
      }
    },
  });

  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  if (auth.data) {
    return <Navigate to="/" replace />;
  }

  return (
    <Card>
      <CardHeader className="text-center border-b">
        <CardTitle>EricFinance</CardTitle>
        <CardDescription>Enter the code sent to {email}</CardDescription>
      </CardHeader>
      <CardContent className="py-5">
        <form.AppForm>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.AppField
                name="code"
                children={(field) => (
                  <field.FormFieldItem>
                    <field.FormFieldLabel>
                      Verification Code
                    </field.FormFieldLabel>
                    <field.FormFieldControl>
                      <Input
                        inputMode="numeric"
                        autoFocus
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="123456"
                      />
                    </field.FormFieldControl>
                    <field.FormFieldMessage />
                    <p className="text-[11px] text-muted-foreground">
                      Check your inbox (and spam) for the code.
                    </p>
                  </field.FormFieldItem>
                )}
              />
              <Button type="submit" className="w-full">
                Verify & Continue
              </Button>
            </FieldGroup>
          </form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
