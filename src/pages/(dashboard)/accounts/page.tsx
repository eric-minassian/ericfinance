import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useDB } from "@/hooks/db";
import { Account, accountsTable } from "@/lib/db/schema";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AccountsPage() {
  const { db } = useDB();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await db!.select().from(accountsTable);
        setAccounts(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch accounts");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [db]);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/accounts/create">Create Account</Link>
        </Button>
      </div>
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader>
            <CardTitle>{account.name}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
