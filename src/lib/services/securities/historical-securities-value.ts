import { securitiesTable } from "@/lib/db/schema/securities";
import { securityPricesTable } from "@/lib/db/schema/security-prices";
import { Database } from "@/lib/types";

type HistoricalSecuritiesValueRequest = {
  db: Database;
};

type HistoricalSecuritiesValueResponse = Map<Date, number>;

export async function historicalSecuritiesValue({
  db,
}: HistoricalSecuritiesValueRequest): Promise<HistoricalSecuritiesValueResponse> {
  const data = db.values<Array<Array<string | number | Date>>>(`
        WITH AllUniqueDates AS (
            -- Corrected to UNION for distinct dates
            SELECT DISTINCT date FROM securities
            UNION
            SELECT DISTINCT date FROM security_prices
        ),
        RankedPrices AS (
            SELECT
                sp.ticker,
                sp.date,
                sp.price,
                -- This ROW_NUMBER is to pick a single price if multiple exist for the same ticker/date.
                -- The ORDER BY clause should ideally use a more determinate tie-breaker
                -- if multiple price entries for the exact same ticker and date can exist
                -- and one is preferred (e.g., ORDER BY sp.import_timestamp DESC or sp.id DESC).
                -- If (ticker, date) is unique in security_prices, rn will always be 1.
                ROW_NUMBER() OVER (PARTITION BY sp.ticker, sp.date ORDER BY sp.date DESC /*Consider a more specific tie-breaker here if necessary */) as rn
            FROM
                security_prices sp
        ),
        EffectivePrices AS (
            -- This CTE provides a single, effective price for each ticker on a given date from security_prices.
            SELECT
                ticker,
                date,
                price
            FROM
                RankedPrices
            WHERE
                rn = 1
        )
        SELECT
            ad.date,
            s.ticker, -- Ticker from the 'securities' table that has a record on ad.date
            COALESCE(SUM(s.amount), 0) AS totalAmount, -- Sum of amounts for s.ticker on ad.date from the 'securities' table.
                                                    -- If 'securities' typically has one entry per ticker per date, SUM() still works.
            COALESCE(
                ep.price, -- Price from EffectivePrices for the exact ad.date and s.ticker
                (
                    -- Fallback: get the latest price strictly before ad.date for s.ticker
                    SELECT prev_ep.price
                    FROM EffectivePrices prev_ep
                    WHERE prev_ep.ticker = s.ticker -- Match the current security's ticker
                    AND prev_ep.date < ad.date
                    ORDER BY prev_ep.date DESC
                    LIMIT 1
                )
            ) AS latestPrice,
            COALESCE(SUM(s.amount), 0) *
            COALESCE(
                ep.price, -- Price on exact date
                (
                    -- Fallback: latest price before ad.date
                    SELECT prev_ep.price
                    FROM EffectivePrices prev_ep
                    WHERE prev_ep.ticker = s.ticker
                    AND prev_ep.date < ad.date
                    ORDER BY prev_ep.date DESC
                    LIMIT 1
                ),
                0 -- Default price to 0 if no price is found (neither exact nor previous) to ensure valueInCents is not NULL.
            ) AS valueInCents
        FROM
            AllUniqueDates ad
        LEFT JOIN
            securities s ON ad.date = s.date -- Join security records that fall on ad.date
        LEFT JOIN
            EffectivePrices ep ON ad.date = ep.date AND s.ticker = ep.ticker -- Join the price for the exact date and ticker
        WHERE
            s.ticker IS NOT NULL -- Process rows only if there's an actual security record from 's'.
                                -- This means we are calculating values for amounts recorded in the 'securities' table.
        GROUP BY
            ad.date, s.ticker -- Group by the date and the specific ticker from the 'securities' record
        ORDER BY
            ad.date, s.ticker;
        `);

  console.log("data", data);

  // const crazyQuery = db.select({
  //     date: securitiesTable.date,
  //     valueInCents: sum()
  // })
  // .from(securitiesTable)
  // .groupBy(securitiesTable.date)
  // .orderBy(asc(securitiesTable.date));

  /* 
    SELECT 
        date,
        SUM(amount * price) AS valueInCents
    FROM
        securities
    JOIN
        security_prices
    ON
        securities.ticker = security_prices.ticker
    WHERE
        securities.date = security_prices.date
    GROUP BY
        date
    ORDER BY
        date;
    */

  const allSecurities = await db.select().from(securitiesTable);
  const allSecurityPrices = await db.select().from(securityPricesTable);

  const priceMap = new Map<string, Map<number, number>>();
  for (const sp of allSecurityPrices) {
    if (!priceMap.has(sp.ticker)) {
      priceMap.set(sp.ticker, new Map<number, number>());
    }
    priceMap.get(sp.ticker)!.set(sp.date.getTime(), sp.price);
  }

  const tempResults = new Map<number, number>();

  for (const security of allSecurities) {
    const ticker = security.ticker;
    const dateTimestamp = security.date.getTime();
    const amount = security.amount;

    const tickerPrices = priceMap.get(ticker);
    if (tickerPrices) {
      const price = tickerPrices.get(dateTimestamp);

      if (price !== undefined) {
        const value = amount * price;

        tempResults.set(
          dateTimestamp,
          (tempResults.get(dateTimestamp) || 0) + value
        );
      }
    }
  }

  const resultMap = new Map<Date, number>();
  for (const [timestamp, totalValue] of tempResults) {
    resultMap.set(new Date(timestamp), totalValue);
  }

  // 6. Return resultMap
  return resultMap;
}
