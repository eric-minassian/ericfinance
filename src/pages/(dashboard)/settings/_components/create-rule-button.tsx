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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDB } from "@/hooks/db";
import { useAppForm } from "@/hooks/form";
import { useListCategories } from "@/lib/services/categories/list-categories";
import { createRule } from "@/lib/services/rules/create-rule";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export function CreateRuleButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon variant="plus" />
          Create Rule
        </Button>
      </DialogTrigger>

      <CreateRuleDialog setOpen={setOpen} />
    </Dialog>
  );
}

const ruleStatementValidator = z.object({
  field: z.string().min(1, "Field is required"),
  operator: z.enum([
    "equals",
    "not_equals",
    "greater_than",
    "less_than",
    "greater_than_or_equals",
    "less_than_or_equals",
    "contains",
    "not_contains",
    "starts_with",
    "ends_with",
  ]),
  value: z.string().min(1, "Value is required"),
});

const createRuleFormValidator = z.object({
  updateField: z.enum(["categoryId", "payee", "notes"]),
  updateValue: z.string().min(1, "Update value is required"),
  statements: z
    .array(ruleStatementValidator)
    .min(1, "At least one condition is required"),
});

interface CreateRuleDialogProps {
  setOpen: (open: boolean) => void;
}

const UPDATE_FIELDS = [
  { value: "categoryId", label: "Category" },
  { value: "payee", label: "Payee" },
  { value: "notes", label: "Notes" },
] as const;

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "greater_than_or_equals", label: "Greater Than or Equals" },
  { value: "less_than_or_equals", label: "Less Than or Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "starts_with", label: "Starts With" },
  { value: "ends_with", label: "Ends With" },
] as const;

function CreateRuleDialog({ setOpen }: CreateRuleDialogProps) {
  const { db } = useDB();

  const { data: categories = [] } = useListCategories();

  const form = useAppForm({
    validators: { onSubmit: createRuleFormValidator },
    defaultValues: {
      updateField: "categoryId",
      updateValue: "",
      statements: [
        {
          field: "",
          operator: "equals",
          value: "",
        },
      ],
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedValue = createRuleFormValidator.parse(value);

        await createRule({
          db: db!,
          rule: {
            updateField: validatedValue.updateField,
            updateValue: validatedValue.updateValue,
            statements: validatedValue.statements.map((stmt) => ({
              field: stmt.field,
              operator: stmt.operator,
              value: stmt.value,
            })),
          },
        });
        toast.success("Rule created successfully!");
        form.reset();
        setOpen(false);
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to create rule. Check the console for more details."
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
    <DialogContent className="min-w-9/12 max-w-3xl">
      <DialogHeader>
        <DialogTitle>Create Rule</DialogTitle>
      </DialogHeader>
      <form.AppForm>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="updateField"
              children={(field) => (
                <field.FormFieldItem>
                  <field.FormFieldLabel>Update Field</field.FormFieldLabel>
                  <field.FormFieldControl>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        // Reset updateValue when updateField changes
                        form.setFieldValue("updateValue", "");
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select field to update" />
                      </SelectTrigger>
                      <SelectContent>
                        {UPDATE_FIELDS.map((updateField) => (
                          <SelectItem
                            key={updateField.value}
                            value={updateField.value}
                          >
                            {updateField.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </field.FormFieldControl>
                  <field.FormFieldMessage />
                </field.FormFieldItem>
              )}
            />
            <form.AppField
              name="updateValue"
              children={(field) => {
                const updateField = form.state.values.updateField;
                return (
                  <field.FormFieldItem>
                    <field.FormFieldLabel>Update Value</field.FormFieldLabel>
                    <field.FormFieldControl>
                      {updateField === "categoryId" ? (
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Value to update"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      )}
                    </field.FormFieldControl>
                    <field.FormFieldMessage />
                  </field.FormFieldItem>
                );
              }}
            />
          </div>

          <form.Field name="statements" mode="array">
            {(field) => {
              return (
                <div className="space-y-4 h-[55vh] overflow-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Conditions</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        field.pushValue({
                          field: "",
                          operator: "equals",
                          value: "",
                        })
                      }
                    >
                      <Icon variant="plus" />
                      Add Condition
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {field.state.value.map((_, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-4 border rounded-lg bg-muted/20"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <form.AppField
                            name={`statements[${i}].field`}
                            children={(subField) => (
                              <subField.FormFieldItem>
                                <subField.FormFieldLabel>
                                  Field
                                </subField.FormFieldLabel>
                                <subField.FormFieldControl>
                                  <Input
                                    placeholder="Field name"
                                    value={subField.state.value}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    onBlur={subField.handleBlur}
                                  />
                                </subField.FormFieldControl>
                                <subField.FormFieldMessage />
                              </subField.FormFieldItem>
                            )}
                          />
                          <form.AppField
                            name={`statements[${i}].operator`}
                            children={(subField) => (
                              <subField.FormFieldItem>
                                <subField.FormFieldLabel>
                                  Operator
                                </subField.FormFieldLabel>
                                <subField.FormFieldControl>
                                  <Select
                                    value={subField.state.value}
                                    onValueChange={(value) =>
                                      subField.handleChange(value)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select operator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {OPERATORS.map((operator) => (
                                        <SelectItem
                                          key={operator.value}
                                          value={operator.value}
                                        >
                                          {operator.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </subField.FormFieldControl>
                                <subField.FormFieldMessage />
                              </subField.FormFieldItem>
                            )}
                          />
                          <form.AppField
                            name={`statements[${i}].value`}
                            children={(subField) => (
                              <subField.FormFieldItem>
                                <subField.FormFieldLabel>
                                  Value
                                </subField.FormFieldLabel>
                                <subField.FormFieldControl>
                                  <Input
                                    placeholder="Value to match"
                                    value={subField.state.value}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    onBlur={subField.handleBlur}
                                  />
                                </subField.FormFieldControl>
                                <subField.FormFieldMessage />
                              </subField.FormFieldItem>
                            )}
                          />
                        </div>
                        {field.state.value.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => field.removeValue(i)}
                          >
                            <Icon variant="trash" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          </form.Field>

          <DialogFooter>
            <Button type="submit">Create Rule</Button>
          </DialogFooter>
        </form>
      </form.AppForm>
    </DialogContent>
  );
}
