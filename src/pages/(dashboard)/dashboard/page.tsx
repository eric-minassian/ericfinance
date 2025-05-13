import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { useDB } from "@/hooks/db";
import { transactionsTable } from "@/lib/db/schema/transactions";
import currency from "currency.js";
import { sum } from "drizzle-orm";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { db } = useDB();
  const [continuousAccountsSum, setContinuousAccountsSum] = useState<
    { date: string; amount: number }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      const accounts = await db!
        .select({
          date: transactionsTable.date,
          amount: sum(transactionsTable.amount),
        })
        .from(transactionsTable)
        .groupBy(transactionsTable.date)
        .orderBy(transactionsTable.date);

      const totalSums = [];
      let currentTotal = 0;

      for (const account of accounts) {
        currentTotal += account.amount !== null ? Number(account.amount) : 0;
        totalSums.push({
          date: account.date.toString(),
          amount: currentTotal,
        });
      }

      setContinuousAccountsSum(totalSums);
    }

    fetchData();
  }, [db]);

  function gradientOffset() {
    const dataMax = Math.max(...continuousAccountsSum.map((i) => i.amount));
    const dataMin = Math.min(...continuousAccountsSum.map((i) => i.amount));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  }

  const off = gradientOffset();

  return (
    <ContentLayout header={<Header>Dashboard</Header>}>
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[250px] w-full"
      >
        <AreaChart
          data={continuousAccountsSum}
          accessibilityLayer
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor="green" stopOpacity={1} />
              <stop offset={off} stopColor="red" stopOpacity={1} />
            </linearGradient>
          </defs>
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
              return currency(value.toString(), {
                fromCents: true,
              }).format();
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                }}
                formatter={(value) => {
                  return currency(value.toString(), {
                    fromCents: true,
                  }).format();
                }}
              />
            }
          />
          <Area type="monotone" dataKey="amount" fill="url(#splitColor)" />
          <ReferenceLine y={0} stroke="#000" strokeDasharray="3 3" />
        </AreaChart>
      </ChartContainer>
    </ContentLayout>
  );
}
