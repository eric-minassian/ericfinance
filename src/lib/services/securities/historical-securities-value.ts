// TODO: FIX

import { securitiesTable } from "@/lib/db/schema/securities";
import { Database } from "@/lib/types";
import { asc, sql } from "drizzle-orm";

type HistoricalSecuritiesValueRequest = {
  db: Database;
};

type HistoricalSecuritiesValueResponse = Map<Date, number>;

export async function historicalSecuritiesValue({
  db,
}: HistoricalSecuritiesValueRequest): Promise<HistoricalSecuritiesValueResponse> {
  const securities = await db

    .select({
      date: securitiesTable.date,
      securities: sql`GROUP_CONCAT(${securitiesTable.ticker} || ' (' || ${securitiesTable.amount} || ')')`,
    })
    .from(securitiesTable)
    .groupBy(securitiesTable.date)
    .orderBy(asc(securitiesTable.date));

  console.log("securities", securities);

  // const minDate = new Date(securities[0].date);
  // const maxDate = new Date(securities[securities.length - 1].date);

  // const securityPrices = await db
  //   .select()
  //   .from(securityPricesTable)
  //   .where(lte(securityPricesTable.date, maxDate))
  //   .orderBy(asc(securityPricesTable.date));

  // let securityPricesIdx = 0;
  // while (
  //   securityPricesIdx + 1 < securityPrices.length &&
  //   securityPrices[securityPricesIdx + 1].date <= minDate
  // ) {
  //   securityPricesIdx++;
  // }

  const result = new Map<Date, number>();

  return result;
}
