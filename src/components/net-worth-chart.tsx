import { Button } from "@/components/ui/button";
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
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  XAxis,
  YAxis,
} from "recharts";
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

  // State for zoom functionality
  const [refAreaLeft, setRefAreaLeft] = useState<string>("");
  const [refAreaRight, setRefAreaRight] = useState<string>("");
  const [left, setLeft] = useState<string | number>("dataMin");
  const [right, setRight] = useState<string | number>("dataMax");
  const [top, setTop] = useState<string | number>("dataMax");
  const [bottom, setBottom] = useState<string | number>("dataMin");

  // Transform data for chart with indexed dates
  const chartData = useMemo(() => {
    return (
      data?.map((d, index) => ({
        ...d,
        date: d.date.toISOString(),
        index,
      })) || []
    );
  }, [data]);

  // Helper function to get Y-axis domain for zoomed area
  const getYDomain = (fromIndex: number, toIndex: number) => {
    if (!chartData.length) return [0, 100];

    const slicedData = chartData.slice(fromIndex, toIndex + 1);
    let min = slicedData[0]?.newtWorth || 0;
    let max = slicedData[0]?.newtWorth || 0;

    slicedData.forEach((d) => {
      if (d.newtWorth > max) max = d.newtWorth;
      if (d.newtWorth < min) min = d.newtWorth;
    });

    const padding = Math.abs(max - min) * 0.1; // 10% padding based on absolute range
    return [min - padding, max + padding];
  };

  const zoom = () => {
    let leftIndex = Number(refAreaLeft);
    let rightIndex = Number(refAreaRight);

    if (leftIndex === rightIndex || refAreaRight === "") {
      setRefAreaLeft("");
      setRefAreaRight("");
      return;
    }

    // Ensure left is smaller than right
    if (leftIndex > rightIndex) {
      [leftIndex, rightIndex] = [rightIndex, leftIndex];
    }

    // Set Y-axis domain based on selected area
    const [newBottom, newTop] = getYDomain(leftIndex, rightIndex);

    setRefAreaLeft("");
    setRefAreaRight("");
    setLeft(leftIndex);
    setRight(rightIndex);
    setBottom(newBottom);
    setTop(newTop);
  };

  const zoomOut = () => {
    setRefAreaLeft("");
    setRefAreaRight("");
    setLeft("dataMin");
    setRight("dataMax");
    setTop("dataMax");
    setBottom("dataMin");
  };

  return (
    <Card>
      <CardHeader>
        <Header
          description="Net Worth"
          actions={
            (left !== "dataMin" || right !== "dataMax") && (
              <Button
                variant="outline"
                onClick={zoomOut}
                disabled={left === "dataMin" && right === "dataMax"}
              >
                Reset Zoom
              </Button>
            )
          }
        >
          {formatCurrency(data?.[data.length - 1]?.newtWorth || 0)}
        </Header>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="max-h-80 w-full select-none"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 24, left: 24, right: 12 }}
            onMouseDown={(e) => e?.activeLabel && setRefAreaLeft(e.activeLabel)}
            onMouseMove={(e) =>
              refAreaLeft && e?.activeLabel && setRefAreaRight(e.activeLabel)
            }
            onMouseUp={zoom}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="index"
              type="number"
              scale="linear"
              domain={[left, right]}
              allowDataOverflow
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const item = chartData[value];
                return item
                  ? DateString.fromString(item.date).toMDYString()
                  : "";
              }}
            />
            <YAxis
              domain={[bottom, top]}
              allowDataOverflow
              tickFormatter={formatCurrency}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label, ...props }) => {
                if (!active || !payload?.length) return null;

                const item = chartData[Number(label)];
                const date = item
                  ? DateString.fromString(item.date).toMDYString()
                  : "";

                return (
                  <ChartTooltipContent
                    formatter={formatCurrency}
                    active={active}
                    payload={payload}
                    label={date}
                    {...props}
                  />
                );
              }}
            />
            <Area
              dataKey="newtWorth"
              fill="var(--color-newtWorth)"
              fillOpacity={0.4}
              stroke="var(--color-newtWorth)"
            />
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
                fill="var(--color-newtWorth)"
                fillOpacity={0.1}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
