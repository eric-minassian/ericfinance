import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth";
import { useAppForm } from "@/hooks/form";
import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import { signIn } from "aws-amplify/auth";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number"),
});

export const Route = createFileRoute("/_auth/login")({
  component: LoginRoute,
});

function LoginRoute() {
  const navigate = useNavigate();
  const auth = useAuth();

  const form = useAppForm({
    validators: { onSubmit: loginSchema },
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value, formApi }) => {
      try {
        const { email, password } = loginSchema.parse(value);
        const result = await signIn({ username: email.trim(), password });

        if (result.isSignedIn) {
          toast.success("Signed in");
          navigate({ to: "/" });
          return;
        }

        const next = result.nextStep;
        if (next.signInStep !== "DONE") {
          toast.info(`Next step: ${next.signInStep}`, {
            description:
              "This step is not yet implemented. Please contact support.",
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.name : "AuthError";
        if (message === "NotAuthorizedException") {
          formApi.setErrorMap({
            onSubmit: {
              fields: {
                password: { message: "Incorrect username or password." },
              },
            },
          });
        } else {
          toast.error(err instanceof Error ? err.message : "Failed to sign in");
        }
      }
    },
  });

  if (auth.data) {
    return <Navigate to="/" replace />;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-xl tracking-tight">EricFinance</CardTitle>
        <CardDescription className="text-xs">
          Access your synced portfolio.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-5">
        <form.AppForm>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
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
                      autoComplete="current-password"
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
              Sign In
            </Button>
          </form>
        </form.AppForm>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link">
          <Link to="/signup">Create an account</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
