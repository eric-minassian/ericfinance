import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListCategories } from "./_components/list-categories";
export default function SettingsPage() {
  return (
    <ContentLayout
      header={<Header description="Configure your settings">Settings</Header>}
    >
      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="general">Test</TabsContent>
        <TabsContent value="categories">
          <ListCategories />
        </TabsContent>
        <TabsContent value="rules">Rules</TabsContent>
      </Tabs>
    </ContentLayout>
  );
}
