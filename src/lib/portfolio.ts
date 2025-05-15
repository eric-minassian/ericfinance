import alphavantage from "alphavantage";
import currency from "currency.js";
import { and, asc, eq, gte, lte, or, sum } from "drizzle-orm";
import { getPreviousDate } from "./date";
import { Account, accountsTable } from "./db/schema/accounts";
import { securitiesTable, Security } from "./db/schema/securities";
import { securityPricesTable } from "./db/schema/security-prices";
import { settingsTable } from "./db/schema/settings";
import { transactionsTable } from "./db/schema/transactions";
import { Database } from "./types";

export type GetAccountsValueResponse = Array<Account & { balance: number }>;

export async function getAccountsValue(
  db: Database
): Promise<GetAccountsValueResponse> {
  const accounts = await getAccountsTransactionsValue(db);
  const accountsWithSecurities = await Promise.all(
    accounts.map(async (account) => {
      const securitiesValue = await getAccountSecuritiesValue(db, account.id);
      return {
        ...account,
        balance: account.balance + securitiesValue,
      };
    })
  );

  return accountsWithSecurities;
}

export async function getAccountValue(
  db: Database,
  accountId: Account["id"]
): Promise<number> {
  return db
    .select({
      balance: sum(transactionsTable.amount),
    })
    .from(transactionsTable)
    .where(eq(transactionsTable.accountId, accountId))
    .then((result) => {
      return result[0]?.balance ? parseFloat(result[0].balance) : 0;
    });
}

export async function getAccountsTransactionsValue(
  db: Database
): Promise<Array<Pick<Account, "id" | "name"> & { balance: number }>> {
  const transactions = await db
    .select({
      id: accountsTable.id,
      name: accountsTable.name,
      balance: sum(transactionsTable.amount),
    })
    .from(accountsTable)
    .leftJoin(
      transactionsTable,
      eq(transactionsTable.accountId, accountsTable.id)
    )
    .groupBy(accountsTable.id)
    .orderBy(accountsTable.name);

  return transactions.map((account) => ({
    ...account,
    balance: account.balance ? parseFloat(account.balance) : 0,
  }));
}

export async function getAccountSecuritiesValue(
  db: Database,
  accountId: Account["id"]
): Promise<number> {
  const securities = await db
    .select({
      ticker: securitiesTable.ticker,
      numShares: sum(securitiesTable.amount),
    })
    .from(securitiesTable)
    .where(eq(securitiesTable.accountId, accountId))
    .groupBy(securitiesTable.ticker);

  const securitiesWithPrices = await Promise.all(
    securities.map(async (security) => {
      const prices = await db
        .select({
          price: securityPricesTable.price,
        })
        .from(securityPricesTable)
        .where(
          and(
            eq(securityPricesTable.ticker, security.ticker),
            gte(securityPricesTable.date, getPreviousDate(5))
          )
        )
        .orderBy(asc(securityPricesTable.date));

      const price = prices.pop()?.price;
      return {
        ...security,
        price: price ? price : 0,
      };
    })
  );

  const totalValue = securitiesWithPrices.reduce((acc, security) => {
    return (
      acc +
      (security.price
        ? security.price * (parseFloat(security.numShares ?? "0") ?? 0)
        : 0)
    );
  }, 0);

  return totalValue;
}

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
