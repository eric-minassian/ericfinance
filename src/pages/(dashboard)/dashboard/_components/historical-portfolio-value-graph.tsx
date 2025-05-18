import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDB } from "@/hooks/db";
import { useQuery } from "@/hooks/use-query";
import { historicalPortfolioValue } from "@/lib/services/portfolio/historical-portfolio-value";
import currency from "currency.js";
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

  const { data, error, isPending } = useQuery(async () =>
    (await historicalPortfolioValue({ db: db! })).map((item) => ({
      date: item.date.toString(),
      valueInCents: item.valueInCents,
    }))
  );

  if (error) {
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

  if (data!.length === 0) {
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
        <YAxis
          dataKey="valueInCents"
          tickFormatter={(valueInCents) =>
            currency(valueInCents, { fromCents: true, symbol: "$" }).toString()
          }
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) =>
                currency(value.toString(), { fromCents: true }).format()
              }
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              }}
            />
          }
        />
        <Area type="monotone" dataKey="valueInCents" />
        <ReferenceLine y={0} strokeDasharray="3 3" />
      </AreaChart>
    </ChartContainer>
  );
}
