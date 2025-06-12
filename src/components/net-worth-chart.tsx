import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { useListNetWorth } from "@/lib/services/accounts/get-net-worth";
import { formatCurrency } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Header } from "./ui/header";

const chartConfig = {
  newtWorth: {
    label: "Net Worth",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface NetWorthChartProps {
  accountId?: Account["id"];
}

export function NetWorthChart({ accountId }: NetWorthChartProps) {
  const { data } = useListNetWorth({ accountId });

  return (
    <Card>
      <CardHeader>
        <Header description="Net Worth">
          {formatCurrency(data?.[data.length - 1]?.newtWorth || 0)}
        </Header>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] max-h-[300px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={data?.map((d) => ({ ...d, date: d.date.toISOString() }))}
            margin={{ top: 24, left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveEnd"
              tickFormatter={(value) =>
                DateString.fromString(value).toMDYString()
              }
            />
            <YAxis dataKey="newtWorth" tickFormatter={formatCurrency} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={formatCurrency} />}
            />
            <Area
              dataKey="newtWorth"
              fill="var(--color-newtWorth)"
              fillOpacity={0.4}
              stroke="var(--color-newtWorth)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
