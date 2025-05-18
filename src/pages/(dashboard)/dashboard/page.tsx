import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import { HistoricalPortfolioValueGraph } from "./_components/historical-portfolio-value-graph";

export default function DashboardPage() {
  // const { db } = useDB();
  // const [continuousAccountsSum, setContinuousAccountsSum] = useState<
  //   { date: string; amount: number }[]
  // >([]);

  // useEffect(() => {
  //   async function fetchData() {
  //     setContinuousAccountsSum(await listPortfolioValues(db!, []));
  //   }

  //   fetchData();
  // }, [db]);

  // function gradientOffset() {
  //   const dataMax = Math.max(...continuousAccountsSum.map((i) => i.amount));
  //   const dataMin = Math.min(...continuousAccountsSum.map((i) => i.amount));

  //   if (dataMax <= 0) {
  //     return 0;
  //   }
  //   if (dataMin >= 0) {
  //     return 1;
  //   }

  //   return dataMax / (dataMax - dataMin);
  // }

  // const off = gradientOffset();

  return (
    <ContentLayout header={<Header>Welcome back!</Header>}>
      {/* <ChartContainer
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
      </ChartContainer> */}
      <HistoricalPortfolioValueGraph />
    </ContentLayout>
  );
}
