import { clsx, type ClassValue } from "clsx";
import currency from "currency.js";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: ValueType) {
  return currency(value.toString(), {
    symbol: "$",
    fromCents: true,
  }).format();
}
