import { Account } from "@/lib/db/schema/accounts";
import { useGetAccountBalance } from "@/lib/services/accounts/get-account-balance";
import { cn, formatCurrency } from "@/lib/utils";

interface AccountBalanceProps {
  accountId: Account["id"];
  accountVariant: Account["variant"];
}

export function AccountBalance({
  accountId,
  accountVariant,
}: AccountBalanceProps) {
  const getAccountBalanceQuery = useGetAccountBalance({
    accountId,
    accountVariant,
  });

  if (getAccountBalanceQuery.isPending) {
    return <>Loading...</>;
  }
  if (getAccountBalanceQuery.isError) {
    return <>Error: {getAccountBalanceQuery.error.message}</>;
  }

  return (
    <span
      className={cn(
        "font-semibold",
        getAccountBalanceQuery.data < 0 && "text-destructive"
      )}
    >
      {formatCurrency(getAccountBalanceQuery.data)}
    </span>
  );
}
