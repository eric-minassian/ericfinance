import { Card, CardContent } from "@/components/ui/card";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { Input } from "@/components/ui/input";
import { useDB } from "@/hooks/db";
import { useAppForm } from "@/hooks/form";
import {
  Setting,
  settingsSchema,
  settingsTable,
} from "@/lib/db/schema/settings";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ListCategories } from "./_components/list-categories";

export default function SettingsPage() {
  const { db } = useDB();
  const [settings, setSettings] = useState<Setting>();

  useEffect(() => {
    async function fetchSettings() {
      const settings = await db?.select().from(settingsTable);
      if (settings) {
        setSettings(settings[0]);
      }
    }
    fetchSettings();
  }, [db]);

  const form = useAppForm({
    defaultValues: {
      alphaVantageKey: settings?.alphaVantageKey || "",
    },
    validators: {
      onSubmit: settingsSchema,
    },
    onSubmit: async ({ value }) => {
      if (!db) {
        return;
      }

      try {
        if ((await db.select().from(settingsTable)).length === 0) {
          await db.insert(settingsTable).values(value);
        } else {
          await db.update(settingsTable).set(value);
        }

        toast.success("Settings updated successfully");
      } catch (error) {
        console.error("Error updating settings:", error);
        toast.error("Failed to update settings");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  return (
    <ContentLayout
      header={<Header description="Configure your settings">Settings</Header>}
    >
      <ListCategories />
      <form.AppForm>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardContent>
              <form.AppField
                name="alphaVantageKey"
                children={(field) => (
                  <field.FormFieldItem>
                    <field.FormFieldLabel>
                      Alpha Vantage Key
                    </field.FormFieldLabel>
                    <field.FormFieldControl>
                      <Input
                        placeholder="Enter your Alpha Vantage key"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </field.FormFieldControl>
                    <field.FormFieldDescription>
                      This is your Alpha Vantage key. It can be anything you
                      want.
                    </field.FormFieldDescription>
                    <field.FormFieldMessage />
                  </field.FormFieldItem>
                )}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end space-x-2">
            <form.FormButton>
              {({ isSubmitting }) =>
                isSubmitting ? "Submitting..." : "Submit"
              }
            </form.FormButton>
          </div>
        </form>
      </form.AppForm>
    </ContentLayout>
  );
}
