import Icon from "@/components/icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDB } from "@/hooks/db";
import { useQuery } from "@/hooks/use-query";
import { listAccounts } from "@/lib/services/accounts/list-accounts";
import { cn, formatCurrency } from "@/lib/utils";
import { Link } from "wouter";

export function AccountsList() {
  const { db } = useDB();
  const { data } = useQuery(async () => listAccounts({ db: db! }), [db]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts List</CardTitle>
        <CardDescription>
          List of all accounts with their balances
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data?.map((account, index) => (
          <div key={index}>
            <Separator />
            <Link href={`/accounts/${account.id}`}>
              <div className="hover:bg-accent flex items-center py-4 px-2 rounded-md">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                  <Icon variant="bank" size="lg" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Bank Account
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={cn(
                      "font-semibold",
                      account.balance < 0 && "text-destructive"
                    )}
                  >
                    {formatCurrency(account.balance)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    2 hours ago
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
