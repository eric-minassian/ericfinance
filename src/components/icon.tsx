import { cn } from "@/lib/utils";
import {
  ChartNoAxesCombined,
  ChevronDown,
  Columns3Cog,
  CreditCard,
  Home,
  Import,
  Landmark,
  Plus,
  RefreshCw,
  Settings,
  Trash,
  Upload,
  X,
} from "lucide-react";

const iconMap = {
  logo: ChartNoAxesCombined,
  sync: RefreshCw,
  home: Home,
  card: CreditCard,
  bank: Landmark,
  import: Import,
  settings: Settings,
  customize: Columns3Cog,
  plus: Plus,
  chevronDown: ChevronDown,
  upload: Upload,
  x: X,
  trash: Trash,
};

interface IconProps {
  variant: keyof typeof iconMap;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Icon({
  variant: icon,
  size = "md",
  className,
}: IconProps) {
  const IconComponent = iconMap[icon];

  const sizeClass =
    size === "sm"
      ? "h-4 w-4"
      : size === "md"
      ? "h-5 w-5"
      : size === "lg"
      ? "h-6 w-6"
      : "h-5 w-5"; // default to md if no match

  return <IconComponent className={cn(sizeClass, className)} />;
}
