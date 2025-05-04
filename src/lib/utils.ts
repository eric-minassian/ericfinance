import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function integerCurrencyFormat(
  value: number | string,
  locale = "en-US",
  currency = "USD"
): string {
  const numberValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue / 100);
}

export function currencyFormat(
  value: number | string,
  locale = "en-US",
  currency = "USD"
): string {
  const numberValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(numberValue);
}
