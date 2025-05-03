import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <ContentLayout
      header={
        <Header
          description="Manage your accounts here."
          actions={
            <Button asChild>
              <Link href="/accounts/create">Create Account</Link>
            </Button>
          }
        >
          Accounts
        </Header>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.id}</TableCell>
              <TableCell>{account.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ContentLayout>
  );
}
