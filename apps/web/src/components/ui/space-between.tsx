interface SpaceBetweenProps {
  direction?: "vertical" | "horizontal";
  alignItems?: "start" | "center" | "end";
  size?: "xxxs" | "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  children: React.ReactNode;
}

export function SpaceBetween({
  direction = "horizontal",
  alignItems = "start",
  size = "md",
  children,
}: SpaceBetweenProps) {
  const directionClass = direction === "horizontal" ? "flex-row" : "flex-col";
  const alignItemsClass =
    alignItems === "start"
      ? "items-start"
      : alignItems === "center"
      ? "items-center"
      : "items-end";
  //   const sizeClass = `gap-${size}`;
  const sizeClass =
    size === "xxxs"
      ? "gap-0.5"
      : size === "xxs"
      ? "gap-1"
      : size === "xs"
      ? "gap-2"
      : size === "sm"
      ? "gap-3"
      : size === "md"
      ? "gap-4"
      : size === "lg"
      ? "gap-5"
      : size === "xl"
      ? "gap-6"
      : size === "xxl"
      ? "gap-7"
      : "gap-4"; // default to md if no match

  return (
    <div className={`flex ${directionClass} ${alignItemsClass} ${sizeClass}`}>
      {children}
    </div>
  );
}
