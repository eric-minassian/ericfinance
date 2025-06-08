import Icon from "@/components/icon";
import { ImportDialog } from "@/components/import-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDB } from "@/hooks/db";
import { Account } from "@/lib/db/schema/accounts";
import { deleteAccount } from "@/lib/services/accounts/delete-accoun";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface EditAccountDropdownProps {
  accountId: Account["id"];
  accountVariant: Account["variant"];
}

export function EditAccountDropdown({
  accountId,
  accountVariant,
}: EditAccountDropdownProps) {
  const { db } = useDB();
  const [, navigate] = useLocation();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  async function handleDeleteAccount() {
    if (confirm("Are you sure you want to delete this account?")) {
      await deleteAccount({ db: db!, accountId });
      toast.success("Account deleted successfully");
      navigate("/dashboard/accounts");
    }
  }

  return (
    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Edit
            <Icon variant="chevronDown" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit account</DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem>Upload {accountVariant}</DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDeleteAccount}>
            Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ImportDialog
        accountId={accountId}
        accountVariant={accountVariant}
        setDialogOpen={setImportDialogOpen}
      />
    </Dialog>
  );
}
