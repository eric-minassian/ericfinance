import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useDB } from "@/hooks/db";
import { Accounts, accountsTable } from "@/lib/db/schema";
import { useEffect, useState } from "react";

export default function AccountsPage() {
  const { db } = useDB();

  const [accounts, setAccounts] = useState<Accounts[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await db!.select().from(accountsTable);
      setAccounts(data);
    };
    fetchAccounts();
  }, [db]);

  if (!accounts) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
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
