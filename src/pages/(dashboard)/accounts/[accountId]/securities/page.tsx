import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/ui/content-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Header } from "@/components/ui/header";
import { SpaceBetween } from "@/components/ui/space-between";
import { useDB } from "@/hooks/db";
import { securitiesTable, Security } from "@/lib/db/schema/security";
import { ColumnDef } from "@tanstack/react-table";
import { eq } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

interface AccountSecuritiesPageProps {
  params: {
    accountId: string;
  };
}

export default function AccountSecuritiesPage({
  params,
}: AccountSecuritiesPageProps) {
  const { db } = useDB();

  const [securities, setSecurities] = useState<Security[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSecurities = async () => {
      try {
        const data = await db!
          .select()
          .from(securitiesTable)
          .where(eq(securitiesTable.accountId, params.accountId));
        setSecurities(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch securities");
      } finally {
        setLoading(false);
      }
    };
    fetchSecurities();
  }, [db, params.accountId]);

  async function handleDeleteSecurity(id: Security["id"]) {
    try {
      await db!.delete(securitiesTable).where(eq(securitiesTable.id, id));
      setSecurities((prev) => prev.filter((security) => security.id !== id));
      toast.success("Security deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete security");
    }
  }

  const columns: ColumnDef<Security>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      cell: ({ row }) => {
        return (
          <Link
            href={`/accounts/${params.accountId}/securities/${row.original.id}`}
            className="underline-offset-4 hover:underline"
          >
            {row.original.id}
          </Link>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
    },
    {
      accessorKey: "ticker",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ticker" />
      ),
    },
    {
      accessorKey: "rawData",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Raw Data" />
      ),
      cell: ({ row }) => {
        return <code>{JSON.stringify(row.original.rawData)}</code>;
      },
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
              <Link
                href={`/accounts/${params.accountId}/securities/${row.original.id}/edit`}
                asChild
              >
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  if (
                    confirm("Are you sure you want to delete this security?")
                  ) {
                    handleDeleteSecurity(row.original.id);
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

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <ContentLayout
      header={
        <Header
          description="View and manage your account's securities."
          actions={
            <SpaceBetween>
              <Button asChild>
                <Link href={`/accounts/${params.accountId}/securities/import`}>
                  Import Securities
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/accounts/${params.accountId}/securities/create`}>
                  Create Security
                </Link>
              </Button>
            </SpaceBetween>
          }
        >
          Account Securities
        </Header>
      }
    >
      <DataTable data={securities} columns={columns} />
    </ContentLayout>
  );
}
