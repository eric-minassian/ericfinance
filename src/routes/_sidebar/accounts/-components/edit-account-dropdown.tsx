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
import { Account } from "@/lib/db/schema/accounts";
import { useDeleteAccount } from "@/lib/services/accounts/delete-account";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

interface EditAccountDropdownProps {
  accountId: Account["id"];
  accountVariant: Account["variant"];
}

export function EditAccountDropdown({
  accountId,
  accountVariant,
}: EditAccountDropdownProps) {
  const navigate = useNavigate();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const deleteAccount = useDeleteAccount();

  async function handleDeleteAccount() {
    if (confirm("Are you sure you want to delete this account?")) {
      await deleteAccount.mutateAsync({ accountId });
      toast.success("Account deleted successfully");
      navigate({ to: "/accounts" });
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
          <DropdownMenuItem asChild>
            <DialogTrigger>Upload {accountVariant}</DialogTrigger>
          </DropdownMenuItem>
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
