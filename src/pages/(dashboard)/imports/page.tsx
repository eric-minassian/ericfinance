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
import { useDB } from "@/hooks/db";
import { Import, importsTable } from "@/lib/db/schema/import";
import { ColumnDef } from "@tanstack/react-table";
import { eq } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function ImportsPage() {
  const { db } = useDB();
  const [imports, setImports] = useState<Import[]>([]);

  useEffect(() => {
    const fetchImports = async () => {
      const data = await db!.select().from(importsTable);
      setImports(data);
    };

    fetchImports();
  }, [db]);

  async function handleDeleteImport(id: Import["id"]) {
    try {
      await db!.delete(importsTable).where(eq(importsTable.id, id));
      setImports((prev) => prev.filter((importItem) => importItem.id !== id));
      toast.success("Import deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete import");
    }
  }

  const columns: ColumnDef<Import>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
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
              <Link href={`/imports/${row.original.id}/edit`} asChild>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  if (
                    confirm(
                      "Are you sure you want to delete this import and all its data?"
                    )
                  ) {
                    await handleDeleteImport(row.original.id);
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

  return (
    <ContentLayout
      header={
        <Header description="View and manage your imports.">Imports</Header>
      }
    >
      <DataTable data={imports} columns={columns} />
    </ContentLayout>
  );
}
