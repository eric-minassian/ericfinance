import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { SpaceBetween } from "@/components/ui/space-between";
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
import { Link } from "wouter";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface AccountPageProps {
  params: {
    accountId: string;
  };
}

export default function AccountPage({ params }: AccountPageProps) {
  const { db } = useDB();
  const [continuousAccountsSum, setContinuousAccountsSum] = useState<
    { date: Date; value: number }[]
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
        params.accountId,
        startDate,
        endDate
      );

      console.log(prices["VTIAX"]);
      setContinuousAccountsSum(prices["VTIAX"]);
    }

    fetchData();
  }, [db, params.accountId]);

  return (
    <ContentLayout
      header={
        <Header
          description="View and manage your account."
          actions={
            <SpaceBetween>
              <Button asChild>
                <Link href={`/accounts/${params.accountId}/transactions`}>
                  View Transactions
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/accounts/${params.accountId}/securities`}>
                  View Securities
                </Link>
              </Button>
            </SpaceBetween>
          }
        >
          Account {params.accountId}
        </Header>
      }
    >
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
    </ContentLayout>
  );
}
