import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDB } from "@/hooks/db";
import { useQuery } from "@/hooks/use-query";
import { historicalPortfolioValue } from "@/lib/services/portfolio/historical-portfolio-value";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

export function HistoricalPortfolioValueGraph() {
  const { db } = useDB();

  const { data, isError, isPending } = useQuery(async () =>
    historicalPortfolioValue({ db: db! })
  );

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-red-500">Error loading data</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <ChartContainer config={{}}>
      <AreaChart data={data} accessibilityLayer>
        <CartesianGrid />
        <XAxis dataKey="date" />
        <YAxis dataKey="valueInCents" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="valueInCents" />
        <ReferenceLine y={0} strokeDasharray="3 3" />
      </AreaChart>
    </ChartContainer>
  );
}
