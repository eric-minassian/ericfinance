import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/ui/content-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { eq } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
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

  async function handleDeleteAccount(id: Account["id"]) {
    try {
      await db!.delete(accountsTable).where(eq(accountsTable.id, id));
      setAccounts((prev) => prev.filter((account) => account.id !== id));
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete account");
    }
  }

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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">
                <Button variant="link" className="p-0" asChild>
                  <Link href={`/accounts/${account.id}`}>{account.id}</Link>
                </Button>
              </TableCell>

              <TableCell>{account.name}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href={`/accounts/${account.id}/edit`} asChild>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                    </Link>

                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this account?"
                          )
                        ) {
                          handleDeleteAccount(account.id);
                        }
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ContentLayout>
  );
}
