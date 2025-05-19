import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { HistoricalPortfolioValueGraph } from "./_components/historical-portfolio-value-graph";

export default function DashboardPage() {
  return (
    <ContentLayout header={<Header>Welcome back!</Header>}>
      <HistoricalPortfolioValueGraph />
    </ContentLayout>
  );
}
