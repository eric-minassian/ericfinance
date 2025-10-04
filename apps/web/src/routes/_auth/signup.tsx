import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth";
import { useAppForm } from "@/hooks/form";
import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import { signUp } from "aws-amplify/auth";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
  email: z.email().optional(),
});

const signupSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number"),
});

export const Route = createFileRoute("/_auth/signup")({
  validateSearch: (search) => searchSchema.parse(search),
  component: SignupRoute,
});

function SignupRoute() {
  const navigate = useNavigate();
  const auth = useAuth();

  const search = Route.useSearch();

  const form = useAppForm({
    validators: { onSubmit: signupSchema },
    defaultValues: { email: search.email ?? "", password: "" },
    onSubmit: async ({ value, formApi }) => {
      try {
        const { email, password } = signupSchema.parse(value);
        const { isSignUpComplete, nextStep } = await signUp({
          username: email.trim(),
          password,
        });

        if (!isSignUpComplete && nextStep?.signUpStep === "CONFIRM_SIGN_UP") {
          navigate({
            to: "/confirm",
            search: { email: email.trim() },
          });
        } else if (isSignUpComplete) {
          toast.success("Account created");
        }
      } catch (err: unknown) {
        const errorName = err instanceof Error ? err.name : "Failed to sign up";
        if (errorName === "UsernameExistsException") {
          formApi.setErrorMap({
            onSubmit: {
              fields: { email: { message: "Email already registered" } },
            },
          });
        } else {
          toast.error(err instanceof Error ? err.message : "Failed to sign up");
        }
      }
    },
  });

  if (auth.data) {
    return <Navigate to="/" replace />;
  }

  return (
    <Card>
      <CardHeader className="text-center border-b">
        <CardTitle>EricFinance</CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.AppField
                name="email"
                children={(field) => (
                  <field.FormFieldItem>
                    <field.FormFieldLabel>Email</field.FormFieldLabel>
                    <field.FormFieldControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="you@example.com"
                      />
                    </field.FormFieldControl>
                    <field.FormFieldMessage />
                  </field.FormFieldItem>
                )}
              />
              <form.AppField
                name="password"
                children={(field) => (
                  <field.FormFieldItem>
                    <field.FormFieldLabel>Password</field.FormFieldLabel>
                    <field.FormFieldControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="••••••••"
                      />
                    </field.FormFieldControl>
                    <field.FormFieldMessage />
                  </field.FormFieldItem>
                )}
              />
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </FieldGroup>
          </form>
        </form.AppForm>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <FieldDescription>
          Already have an account? <Link to="/login">Sign in</Link>
        </FieldDescription>
      </CardFooter>
    </Card>
  );
}
