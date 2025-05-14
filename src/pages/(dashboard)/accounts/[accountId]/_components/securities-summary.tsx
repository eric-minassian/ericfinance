import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDB } from "@/hooks/db";
import { securitiesTable } from "@/lib/db/schema/securities";
import { eq, sum } from "drizzle-orm";
import { useEffect, useState } from "react";

interface SecuritiesSummaryProps {
  accountId: string;
}

export function SecuritiesSummary({ accountId }: SecuritiesSummaryProps) {
  const { db } = useDB();
  const [securities, setSecurities] = useState<Record<string, number>>({});

  useEffect(() => {
    async function getSecuritiesSummary() {
      const securities = await db
        ?.select({
          ticker: securitiesTable.ticker,
          quantity: sum(securitiesTable.amount),
        })
        .from(securitiesTable)
        .where(eq(securitiesTable.accountId, accountId))
        .groupBy(securitiesTable.ticker);

      if (!securities) {
        console.error("No securities found");
        return;
      }

      const securitiesFormatted: Record<string, number> = {};

      securities.forEach((security) => {
        securitiesFormatted[security.ticker] = security.quantity
          ? parseFloat(security.quantity)
          : 0;
      });

      setSecurities(securitiesFormatted);
    }

    getSecuritiesSummary();
  }, [db, accountId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Securities Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(securities).map(([ticker, quantity]) => (
          <div key={ticker}>
            {ticker}: {quantity}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
