import { ContentLayout } from "@/components/layout/content-layout";
import { Header } from "@/components/ui/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { ListCategories } from "./-components/list-categories";
import { ListRules } from "./-components/list-rules";
import { SecuritySettings } from "./-components/security-settings";

export const Route = createFileRoute("/_sidebar/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ContentLayout
      header={<Header description="Configure your settings">Settings</Header>}
    >
      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="general">Test</TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="categories">
          <ListCategories />
        </TabsContent>
        <TabsContent value="rules">
          <ListRules />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
}
