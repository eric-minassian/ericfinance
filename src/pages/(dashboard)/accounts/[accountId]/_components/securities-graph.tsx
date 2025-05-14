import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useDB } from "@/hooks/db";
import { getSecuritiesPortfolioValue } from "@/lib/portfolio";
import currency from "currency.js";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

interface SecuritiesGraphProps {
  accountId: string;
}

export function SecuritiesGraph({ accountId }: SecuritiesGraphProps) {
  const { db } = useDB();
  const [continuousAccountsSum, setContinuousAccountsSum] = useState<
    Array<{ date: string; value: number }>
  >([]);

  useEffect(() => {
    async function fetchData() {
      if (!db) {
        return;
      }

      const startDate = new Date("2023-01-01");
      const endDate = new Date();

      const prices = await getSecuritiesPortfolioValue(
        db,
        accountId,
        startDate,
        endDate
      );

      const dailySummaries: Record<string, number> = {};
      Object.values(prices).forEach((securityPricePoints) => {
        securityPricePoints.forEach(({ date, value }) => {
          const dateString = date.toDateString();
          if (!dailySummaries[dateString]) {
            dailySummaries[dateString] = 0;
          }
          dailySummaries[dateString] += value;
        });
      });

      const chartData = Object.entries(dailySummaries)
        .map(([date, value]) => ({
          date,
          value,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      setContinuousAccountsSum(chartData);
    }

    fetchData();
  }, [db, accountId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Securities Graph</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="aspect-auto h-[250px] w-full">
          <AreaChart
            data={continuousAccountsSum}
            accessibilityLayer
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                return currency(value.toString()).format();
              }}
            />
            <ChartTooltip />
            <Area type="monotone" dataKey="value" fill="url(#splitColor)" />
            <ReferenceLine y={0} stroke="#000" strokeDasharray="3 3" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
