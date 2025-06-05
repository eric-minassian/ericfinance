import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { CreateAccountDialog } from "./create-account-dialog";

export function CreateAccountButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon variant="plus" />
          Add Account
        </Button>
      </DialogTrigger>

      <CreateAccountDialog onOpenChange={setOpen} />
    </Dialog>
  );
}
