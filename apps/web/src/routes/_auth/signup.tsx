import { ModeToggle } from "@/components/mode-toggle";
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
import { useDB } from "@/hooks/db";
import { useAppForm } from "@/hooks/form";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  confirmSignUp,
  getCurrentUser,
  signIn,
  signUp,
} from "aws-amplify/auth";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_auth/signup")({
  component: SignupRoute,
});

function SignupRoute() {
  const { db, createEmptyDB } = useDB();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [redirect, setRedirect] = useState(false);
  const [checkedUser, setCheckedUser] = useState(false);

  const signupSchema = z.object({
    email: z.email("Invalid email"),
    password: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number"),
  });

  const verifySchema = z.object({
    code: z.string().min(4, "Too short").max(10, "Too long"),
  });

  // Keep email/password after first step for verification and auto sign-in
  const signupForm = useAppForm({
    validators: { onSubmit: signupSchema },
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value, formApi }) => {
      try {
        const { email, password } = signupSchema.parse(value);
        const { isSignUpComplete, nextStep } = await signUp({
          username: email.trim(),
          password,
          options: {
            userAttributes: { email: email.trim() },
            autoSignIn: true,
          },
        });
        if (!isSignUpComplete && nextStep.signUpStep === "CONFIRM_SIGN_UP") {
          setStep("verify");
          toast.message("Enter the verification code emailed to you");
        } else if (isSignUpComplete) {
          // New user was auto-signed-in. Create a local empty portfolio if one isn't loaded.
          if (!db) {
            await createEmptyDB();
          }
          toast.success("Account created");
          setRedirect(true);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to sign up";
        if (message.includes("UsernameExistsException")) {
          formApi.setErrorMap({
            onSubmit: {
              fields: { email: { message: "Email already registered" } },
            },
          });
        } else {
          toast.error(message);
        }
      }
    },
  });

  const verifyForm = useAppForm({
    validators: { onSubmit: verifySchema },
    defaultValues: { code: "" },
    onSubmit: async ({ value, formApi }) => {
      try {
        const { code } = verifySchema.parse(value);
        const email = signupForm.getFieldValue("email");
        const password = signupForm.getFieldValue("password");
        await confirmSignUp({ username: email.trim(), confirmationCode: code });
        toast.success("Verified. Signing in...");
        const result = await signIn({ username: email.trim(), password });
        if (result.isSignedIn) {
          if (!db) {
            await createEmptyDB();
          }
          setRedirect(true);
        } else {
          toast.message("Proceed with additional step");
        }
      } catch (err: unknown) {
        formApi.setErrorMap({
          onSubmit: { fields: { code: { message: "Invalid code" } } },
        });
        toast.error(err instanceof Error ? err.message : "Verification failed");
      }
    },
  });

  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        setRedirect(true);
      } catch {
        // not logged in
      } finally {
        setCheckedUser(true);
      }
    })();
  }, []);

  const handleSignupSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (step === "form") signupForm.handleSubmit();
    },
    [signupForm, step]
  );

  const handleVerifySubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (step === "verify") verifyForm.handleSubmit();
    },
    [verifyForm, step]
  );

  if (redirect) return <Navigate to="/portfolio-select" />;
  if (!checkedUser)
    return (
      <div className="min-h-svh flex items-center justify-center text-sm text-muted-foreground">
        Checking session...
      </div>
    );

  // Removed legacy handlers & state from prior implementation

  return (
    <div className="relative min-h-svh flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-sm backdrop-blur-sm bg-card/70">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl tracking-tight">
            {step === "verify" ? "Verify Email" : "EricFinance"}
          </CardTitle>
          <CardDescription className="text-[11px]">
            {step === "verify"
              ? `Enter the code sent to ${
                  signupForm.getFieldValue("email") || "your email"
                }`
              : "Create an account to enable sync."}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-5">
          {step === "form" && (
            <signupForm.AppForm>
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <signupForm.AppField
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
                <signupForm.AppField
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
              </form>
            </signupForm.AppForm>
          )}
          {step === "verify" && (
            <verifyForm.AppForm>
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <verifyForm.AppField
                  name="code"
                  children={(field) => (
                    <field.FormFieldItem>
                      <field.FormFieldLabel>
                        Verification Code
                      </field.FormFieldLabel>
                      <field.FormFieldControl>
                        <Input
                          inputMode="numeric"
                          pattern="[0-9]*"
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
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full">
                    Verify & Sign In
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => setStep("form")}
                  >
                    Back
                  </Button>
                </div>
              </form>
            </verifyForm.AppForm>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0">
          <div className="text-center text-xs text-muted-foreground">
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <Link to="/login">Sign in</Link>
            </Button>
            <span className="mx-1">•</span>
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <Link to="/">Back</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
