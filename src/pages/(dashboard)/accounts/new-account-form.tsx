import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDB } from "@/hooks/db";
import { accountsTable } from "@/lib/db/schema";
import { useState } from "react";

interface NewAccountFormProps {
  onSuccess: () => void;
}

export default function NewAccountForm({ onSuccess }: NewAccountFormProps) {
  const { db } = useDB();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Account name is required");
      return;
    }

    if (!db) {
      setError("Database not initialized");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await db.insert(accountsTable).values({
        name: name.trim(),
      });

      setName("");
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-6">
      <div className="space-y-2">
        <Label htmlFor="account-name">Account Name</Label>
        <Input
          id="account-name"
          placeholder="e.g., Checking Account, Savings Account"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Account"}
        </Button>
      </div>
    </form>
  );
}
