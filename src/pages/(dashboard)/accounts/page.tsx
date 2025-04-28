import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useDB } from "@/hooks/db";
import { Accounts, accountsTable } from "@/lib/db/schema";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import NewAccountForm from "./new-account-form";

export default function AccountsPage() {
  const { db } = useDB();

  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await db!.select().from(accountsTable);
        setAccounts(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch accounts");
      }

      setLoading(false);
    };
    fetchAccounts();
  }, [db]);

  const refreshAccounts = async () => {
    if (!db) return;
    const data = await db.select().from(accountsTable);
    setAccounts(data);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Accounts</h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Account
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create a new account</SheetTitle>
            </SheetHeader>
            <NewAccountForm
              onSuccess={() => {
                setOpen(false);
                refreshAccounts();
                toast.success("Account created successfully");
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {accounts.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No accounts found. Create your first account to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className="flex flex-col hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => (window.location.href = `/accounts/${account.id}`)}
            >
              <CardHeader>
                <CardTitle>{account.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Balance information could go here in the future */}
              </CardContent>
              <CardFooter className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  asChild
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation to account details
                  }}
                >
                  <Link href={`/accounts/${account.id}/transactions/new`}>
                    Add Transaction
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
