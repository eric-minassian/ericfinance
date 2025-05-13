import alphavantage from "alphavantage";
import currency from "currency.js";
import { and, asc, eq, gte, lte, or } from "drizzle-orm";
import { Account } from "./db/schema/accounts";
import { securitiesTable, Security } from "./db/schema/securities";
import { securityPricesTable } from "./db/schema/security-prices";
import { settingsTable } from "./db/schema/settings";
import { Database } from "./types";

export async function getSecuritiesPortfolioValue(
  db: Database,
  accountId: Account["id"],
  startDate: Date,
  endDate: Date
): Promise<Record<string, { date: Date; value: number }[]>> {
  const result: Record<string, { date: Date; value: number }[]> = {};
  const securities = await getDistinctSecurities(db, accountId);

  for (const ticker of securities) {
    const transactions = await getDateOrderedSecurityTransactions(
      db,
      ticker,
      accountId,
      startDate,
      endDate
    );

    let prices = await getOrderedSecurityPrices(db, ticker, startDate, endDate);
    if (prices.length === 0) {
      await refreshSecurityPrices(db, ticker);
      prices = await getOrderedSecurityPrices(db, ticker, startDate, endDate);
    }

    const portfolioWorthLog: {
      date: string;
      shares: number;
      worth: number;
    }[] = [];
    let cumulativeShares = 0;
    let transactionIndex = 0;

    for (const priceEntry of prices) {
      const currentDate = priceEntry.date;

      while (
        transactionIndex < transactions.length &&
        transactions[transactionIndex].date.getTime() <= currentDate.getTime()
      ) {
        cumulativeShares += transactions[transactionIndex].amount;
        transactionIndex++;
      }

      const dailyWorth = cumulativeShares * priceEntry.price;
      portfolioWorthLog.push({
        date: currentDate.toISOString().split("T")[0],
        shares: cumulativeShares,
        worth: dailyWorth,
      });
    }

    result[ticker] = portfolioWorthLog.map((entry) => ({
      date: new Date(entry.date),
      value: entry.worth,
    }));
  }

  return result;
}

async function getDistinctSecurities(
  db: Database,
  accountId: Account["id"]
): Promise<string[]> {
  const securities = await db
    .selectDistinct({ ticker: securitiesTable.ticker })
    .from(securitiesTable)
    .where(eq(securitiesTable.accountId, accountId));

  return securities.map((security) => security.ticker);
}

async function getDateOrderedSecurityTransactions(
  db: Database,
  ticker: string,
  accountId: Account["id"],
  startDate: Date,
  endDate: Date
): Promise<Pick<Security, "date" | "amount">[]> {
  const securities = await db
    .select({
      date: securitiesTable.date,
      amount: securitiesTable.amount,
    })
    .from(securitiesTable)
    .where(
      and(
        eq(securitiesTable.accountId, accountId),
        eq(securitiesTable.ticker, ticker),
        or(
          gte(securitiesTable.date, startDate),
          lte(securitiesTable.date, endDate)
        )
      )
    )
    .orderBy(asc(securitiesTable.date));

  return securities;
}

async function getOrderedSecurityPrices(
  db: Database,
  ticker: string,
  startDate: Date,
  endDate: Date
): Promise<{ date: Date; price: number }[]> {
  const prices = await db
    .select({
      date: securityPricesTable.date,
      price: securityPricesTable.price,
    })
    .from(securityPricesTable)
    .where(
      and(
        eq(securityPricesTable.ticker, ticker),
        gte(securityPricesTable.date, startDate),
        lte(securityPricesTable.date, endDate)
      )
    )
    .orderBy(asc(securityPricesTable.date));

  return prices.map((price) => ({
    ...price,
    price: currency(price.price, { fromCents: true }).value,
  }));
}

async function refreshSecurityPrices(db: Database, ticker: string) {
  const [settings] = await db.select().from(settingsTable);
  const alphaVantageKey = settings?.alphaVantageKey;
  if (!alphaVantageKey) {
    console.error("Alpha Vantage API key not found");
    return;
  }

  const alphaClient = alphavantage({ key: alphaVantageKey });
  const prices = (await alphaClient.data.daily(ticker, "full")) as unknown as {
    "Time Series (Daily)": Record<
      string,
      {
        "1. open": string;
        "2. high": string;
        "3. low": string;
        "4. close": string;
        "5. volume": string;
      }
    >;
  };
  const priceEntries = Object.entries(prices["Time Series (Daily)"]).map(
    ([date, data]) => ({
      date: new Date(date),
      price: currency(data["4. close"]).intValue,
      ticker,
    })
  );

  await db
    .delete(securityPricesTable)
    .where(eq(securityPricesTable.ticker, ticker));
  await db.insert(securityPricesTable).values(priceEntries);
}
