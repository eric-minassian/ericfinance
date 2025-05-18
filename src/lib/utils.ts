import { clsx, type ClassValue } from "clsx";
import currency from "currency.js";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}
export function formatCurrency(value: ValueType) {
  return currency(value.toString(), {
    symbol: "$",
    fromCents: true,
  }).format();
}
