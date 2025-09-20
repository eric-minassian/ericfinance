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
import { DBContext } from "@/context/db";
import { useDB } from "@/hooks/db";
import { useAppForm } from "@/hooks/form";
import { usePortfolioSync } from "@/hooks/use-portfolio-sync";
import { decryptDatabase, isEncryptedDatabase } from "@/lib/crypto";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { confirmSignIn, getCurrentUser, signIn } from "aws-amplify/auth";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_auth/login")({
  component: LoginRoute,
});

function LoginRoute() {
  const { db, createEmptyDB, importDecryptedDatabase } =
    useDB() as unknown as React.ContextType<typeof DBContext>;
  const { client: portfolioClient } = usePortfolioSync();
  const [step, setStep] = useState<"form" | "mfa">("form");
  const [checkedUser, setCheckedUser] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [postAuthSync, setPostAuthSync] = useState(false);

  const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number"),
  });

  const mfaSchema = z.object({
    code: z.string().min(4, "Too short").max(10, "Too long"),
  });

  const loginForm = useAppForm({
    validators: { onSubmit: loginSchema },
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value, formApi }) => {
      try {
        const { email, password } = loginSchema.parse(value);
        const result = await signIn({ username: email.trim(), password });
        if (result.isSignedIn) {
          if (!db) {
            await createEmptyDB();
          }
          // Trigger remote sync attempt after redirect
          setPostAuthSync(true);
          toast.success("Signed in");
          setRedirect(true);
          return;
        }
        const next = result.nextStep;
        if (next.signInStep === "CONFIRM_SIGN_IN_WITH_SMS_CODE") {
          setStep("mfa");
          toast.message("Enter the verification code sent to you");
        } else if (next.signInStep !== "DONE") {
          toast.info(`Next step: ${next.signInStep}`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.name : "AuthError";
        if (message === "NotAuthorizedException") {
          formApi.setErrorMap({
            onSubmit: {
              fields: {
                password: { message: "Incorrect email or password" },
              },
            },
          });
        } else {
          toast.error(err instanceof Error ? err.message : "Failed to sign in");
        }
      }
    },
  });

  const mfaForm = useAppForm({
    validators: { onSubmit: mfaSchema },
    defaultValues: { code: "" },
    onSubmit: async ({ value, formApi }) => {
      try {
        const { code } = mfaSchema.parse(value);
        const result = await confirmSignIn({ challengeResponse: code });
        if (result.isSignedIn) {
          if (!db) {
            await createEmptyDB();
          }
          setPostAuthSync(true);
          toast.success("Signed in");
          setRedirect(true);
        } else {
          toast.message("Additional step required");
        }
      } catch (err: unknown) {
        formApi.setErrorMap({
          onSubmit: { fields: { code: { message: "Invalid code" } } },
        });
        toast.error(err instanceof Error ? err.message : "Code invalid");
      }
    },
  });

  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        setRedirect(true);
      } catch {
        // not signed in
      } finally {
        setCheckedUser(true);
      }
    })();
  }, []);
  const handleLoginSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (step === "form") loginForm.handleSubmit();
    },
    [loginForm, step]
  );

  const handleMfaSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (step === "mfa") mfaForm.handleSubmit();
    },
    [mfaForm, step]
  );

  // After redirect flag, try remote fetch (handled before navigation completes on next route)
  if (redirect) {
    // Fire-and-forget remote sync attempt (simple heuristic) - real implementation would live in dashboard
    (async () => {
      if (postAuthSync && portfolioClient && importDecryptedDatabase) {
        try {
          const check = await portfolioClient.checkRemote();
          if (check.exists && check.presignedUrl) {
            const pwd = window.prompt(
              "Remote encrypted portfolio found. Enter password to decrypt (or cancel to skip)"
            );
            if (pwd) {
              const blobRes = await fetch(check.presignedUrl);
              if (blobRes.ok) {
                const buf = new Uint8Array(await blobRes.arrayBuffer());
                if (isEncryptedDatabase(buf)) {
                  const decrypted = await decryptDatabase(buf, pwd);
                  await importDecryptedDatabase(decrypted, pwd);
                  toast.success("Remote portfolio loaded");
                } else {
                  toast.error("Remote object not in encrypted format");
                }
              }
            }
          }
        } catch (e) {
          console.warn("Remote sync failed", e);
        }
      }
    })();
    return <Navigate to="/portfolio-select" />;
  }

  if (!checkedUser) {
    return (
      <div className="min-h-svh flex items-center justify-center text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return (
    <div className="relative min-h-svh flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-sm backdrop-blur-sm bg-card/70">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl tracking-tight">
            {step === "mfa" ? "Verify Sign In" : "EricFinance"}
          </CardTitle>
          <CardDescription className="text-[11px]">
            {step === "mfa"
              ? "Enter the code sent to you"
              : "Access your synced portfolio."}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-5">
          {step === "form" && (
            <loginForm.AppForm>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <loginForm.AppField
                  name="email"
                  children={(field) => (
                    <field.FormFieldItem>
                      <field.FormFieldLabel>Email</field.FormFieldLabel>
                      <field.FormFieldControl>
                        <Input
                          type="email"
                          autoComplete="username"
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
                <loginForm.AppField
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
            </loginForm.AppForm>
          )}
          {step === "mfa" && (
            <mfaForm.AppForm>
              <form onSubmit={handleMfaSubmit} className="space-y-4">
                <mfaForm.AppField
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
                    </field.FormFieldItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full">
                    Confirm
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
            </mfaForm.AppForm>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0">
          <div className="text-center text-xs text-muted-foreground">
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <Link to="/signup">Create an account</Link>
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
