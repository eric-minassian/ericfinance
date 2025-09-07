import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppForm } from "@/hooks/form";
import { useCreateCategory } from "@/lib/services/categories/create-category";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export function CreateCategoryButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon variant="plus" />
          Create Category
        </Button>
      </DialogTrigger>

      <CreateCategoryDialog setOpen={setOpen} />
    </Dialog>
  );
}

const createCategoryFormValidator = z.object({
  name: z.string().min(1, "Category name is required"),
});

interface CreateCategoryDialogProps {
  setOpen: (open: boolean) => void;
}

function CreateCategoryDialog({ setOpen }: CreateCategoryDialogProps) {
  const createCategoryMutation = useCreateCategory();

  const form = useAppForm({
    validators: { onSubmit: createCategoryFormValidator },
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await createCategoryMutation.mutateAsync({ name: value.name });
        toast.success(`Category ${value.name} created successfully!`);
        form.reset();
        setOpen(false);
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to create category. Check the console for more details."
        );
      }
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Category</DialogTitle>
      </DialogHeader>
      <form.AppForm>
        <form onSubmit={handleSubmit} className="space-y-4">
          <form.AppField
            name="name"
            children={(field) => (
              <field.FormFieldItem>
                <field.FormFieldLabel>Name</field.FormFieldLabel>
                <field.FormFieldControl>
                  <Input
                    placeholder="New Category"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </field.FormFieldControl>
                <field.FormFieldMessage />
              </field.FormFieldItem>
            )}
          />
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </form.AppForm>
    </DialogContent>
  );
}
