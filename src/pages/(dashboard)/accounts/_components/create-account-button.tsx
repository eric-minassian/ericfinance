import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CreateAccountDialog } from "./create-account-dialog";

export function CreateAccountButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Icon variant="plus" />
          Add Account
        </Button>
      </DialogTrigger>

      <CreateAccountDialog />
    </Dialog>
  );
}
