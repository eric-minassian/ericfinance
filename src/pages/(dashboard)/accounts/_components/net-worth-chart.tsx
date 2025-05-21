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
import { Account } from "@/lib/db/schema/accounts";
import { getHistoricalNetWorth } from "@/lib/services/accounts/get-net-worth";
import { formatCurrency, formatDateString } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  netWorthInCents: {
    label: "Net Worth",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface NetWorthChartProps {
  accountId?: Account["id"];
}

export function NetWorthChart({ accountId }: NetWorthChartProps) {
  const { db } = useDB();
  const { data } = useQuery({
    queryKey: ["getHistoricalNetWorth", accountId],
    queryFn: () => getHistoricalNetWorth({ db: db!, accountId }),
  });

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
            margin={{ top: 24, left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDateString}
            />
            <YAxis dataKey="netWorthInCents" tickFormatter={formatCurrency} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={formatCurrency}
                  labelFormatter={formatDateString}
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
