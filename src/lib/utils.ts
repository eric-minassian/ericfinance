import { clsx, type ClassValue } from "clsx";
import currency from "currency.js";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateString(date: string) {
  const d = new Date(date);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
}

export function formatDate(date: Date) {
  return `${
    date.getUTCMonth() + 1
  }/${date.getUTCDate()}/${date.getUTCFullYear()}`;
}

export function formatCurrency(value: ValueType) {
  return currency(value.toString(), {
    symbol: "$",
    fromCents: true,
  }).format();
}

export function parseUTCDate(date: string) {
  const parsedDate = new Date(date);
  return new Date(
    Date.UTC(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
      parsedDate.getHours(),
      parsedDate.getMinutes(),
      parsedDate.getSeconds(),
      parsedDate.getMilliseconds()
    )
  );
}
