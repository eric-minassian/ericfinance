import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ContentLayout } from "@/components/ui/content-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Header } from "@/components/ui/header";
import { useDB } from "@/hooks/db";
import { useQuery } from "@/hooks/use-query";
import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { getAccountsValue, GetAccountsValueResponse } from "@/lib/portfolio";
import { integerCurrencyFormat } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { eq } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AccountsPage() {
  const { db } = useDB();
  const { data, setData, isError, isPending } = useQuery(
    async () => getAccountsValue(db!),
    [db]
  );

  async function handleDeleteAccount(id: Account["id"]) {
    try {
      await db!.delete(accountsTable).where(eq(accountsTable.id, id));
      setData((prev) => {
        if (!prev) return [];

        return prev.filter((account) => account.id !== id);
      });
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete account");
    }
  }

  const columns: ColumnDef<GetAccountsValueResponse[number]>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      cell: ({ row }) => {
        return (
          <Link
            href={`/accounts/${row.original.id}`}
            className="underline-offset-4 hover:underline"
          >
            {row.original.id}
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance" />
      ),
      cell: ({ row }) => integerCurrencyFormat(row.getValue("balance")),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/accounts/${row.original.id}/edit`} asChild>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  if (
                    confirm("Are you sure you want to delete this account?")
                  ) {
                    handleDeleteAccount(row.original.id);
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isError) {
    return <div>Error loading accounts</div>;
  }

  if (isPending) {
    return <div>Loading...</div>;
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
      <DataTable data={data} columns={columns} searchColumn="name" />
    </ContentLayout>
  );
}
