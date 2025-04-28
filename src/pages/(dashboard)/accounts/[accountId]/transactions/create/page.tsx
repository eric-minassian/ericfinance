import { useDB } from "@/hooks/db";
import { accountsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";
import CreateTransactionForm from "./create-transaction-form";

export default function CreateTransactionPage() {
  const { db } = useDB();
  const params = useParams<{ accountId: string }>();
  const [, setLocation] = useLocation();

  const [accountName, setAccountName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        if (!db || !params.accountId) return;

        const account = await db
          .select()
          .from(accountsTable)
          .where(eq(accountsTable.id, params.accountId));

        if (account && account.length > 0) {
          setAccountName(account[0].name);
        } else {
          toast.error("Account not found");
          setLocation("/accounts");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch account details");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, [db, params.accountId, setLocation]);

  const handleSuccess = () => {
    toast.success("Transaction added successfully");
    setLocation(`/accounts/${params.accountId}`);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Add Transaction</h2>
        <p className="text-muted-foreground">
          Add a new transaction to {accountName}
        </p>
      </div>

      <CreateTransactionForm
        accountId={params.accountId!}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
