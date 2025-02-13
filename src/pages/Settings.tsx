import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePortfolioStore } from "@/lib/stores/portfolio-store";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { selectedPortfolio, deletePortfolio } = usePortfolioStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  async function handleDelete() {
    if (!selectedPortfolio || confirmName !== selectedPortfolio) {
      toast.error("Portfolio name doesn't match");
      return;
    }

    try {
      await deletePortfolio(selectedPortfolio);
      toast.success("Portfolio deleted successfully");
      setDeleteDialogOpen(false);
      setConfirmName("");
    } catch (error) {
      toast.error(error as string);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Delete Portfolio</CardTitle>
          <CardDescription>
            This action cannot be undone. This will permanently delete your
            portfolio and all its data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedPortfolio ? (
            <p>
              Current portfolio:{" "}
              <span className="font-semibold">{selectedPortfolio}</span>
            </p>
          ) : (
            <p className="text-muted-foreground">No portfolio selected</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={!selectedPortfolio}
          >
            Delete Portfolio
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Portfolio</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please type "{selectedPortfolio}" to
              confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder="Type portfolio name to confirm"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmName !== selectedPortfolio}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
