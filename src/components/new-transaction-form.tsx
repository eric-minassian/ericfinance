import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDB } from "@/hooks/db";
import { transactionsTable } from "@/lib/db/schema";
import { useState } from "react";

interface NewTransactionFormProps {
  accountId: string;
  onSuccess: () => void;
}

export default function NewTransactionForm({
  accountId,
  onSuccess,
}: NewTransactionFormProps) {
  const { db } = useDB();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    payee: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAmount = (amount: string): boolean => {
    // Basic validation for amount, should be a valid number
    return !isNaN(parseFloat(amount)) && parseFloat(amount) !== 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.amount || !formData.date || !formData.payee) {
      setError("Please fill out all required fields");
      return;
    }

    if (!validateAmount(formData.amount)) {
      setError("Please enter a valid amount");
      return;
    }

    if (!db) {
      setError("Database not initialized");
      return;
    }

    setIsSubmitting(true);

    try {
      await db.insert(transactionsTable).values({
        accountId,
        amount: formData.amount,
        date: formData.date,
        payee: formData.payee,
        notes: formData.notes || null,
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount*</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date*</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payee">Payee*</Label>
        <Input
          id="payee"
          name="payee"
          placeholder="e.g., Grocery Store, Utilities"
          value={formData.payee}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          name="notes"
          placeholder="Optional notes about this transaction"
          value={formData.notes}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}
