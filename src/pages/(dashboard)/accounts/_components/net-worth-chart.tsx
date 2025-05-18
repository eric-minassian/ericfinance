import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDB } from "@/hooks/db";
import { useQuery } from "@/hooks/use-query";
import { getHistoricalNetWorth } from "@/lib/services/accounts/get-net-worth";
import currency from "currency.js";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

const chartConfig = {
  netWorthInCents: {
    label: "Net Worth",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function NetWorthChart() {
  const { db } = useDB();
  const { data } = useQuery(
    async () => getHistoricalNetWorth({ db: db! }),
    [db]
  );

  function formatDate(date: string) {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  }
  function formatCurrency(value: ValueType) {
    return currency(value.toString(), {
      symbol: "$",
      fromCents: true,
    }).format();
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription className="text-xs">NET WORTH</CardDescription>
        <CardTitle className="text-2xl">
          {formatCurrency(data?.[data.length - 1]?.netWorthInCents || 0)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] max-h-[300px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, top: 24 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />
            <YAxis dataKey="netWorthInCents" tickFormatter={formatCurrency} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={formatCurrency}
                  labelFormatter={formatDate}
                />
              }
            />
            <Area
              dataKey="netWorthInCents"
              fill="var(--color-netWorthInCents)"
              fillOpacity={0.4}
              stroke="var(--color-netWorthInCents)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
