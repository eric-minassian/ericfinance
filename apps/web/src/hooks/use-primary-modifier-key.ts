import * as React from "react";

const MAC_MODIFIER = {
  symbol: "⌘",
  label: "Command",
  ariaLabel: "Command",
  eventKey: "metaKey" as const,
};

const DEFAULT_MODIFIER = {
  symbol: "Ctrl",
  label: "Control",
  ariaLabel: "Control",
  eventKey: "ctrlKey" as const,
};

type Modifier = typeof MAC_MODIFIER | typeof DEFAULT_MODIFIER;

function detectIsApplePlatform(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const platform =
    navigator.platform?.toLowerCase() ??
    navigator.userAgent?.toLowerCase() ??
    "";

  return /mac|iphone|ipad|ipod/.test(platform);
}

export function getPrimaryModifierKey(): Modifier {
  return detectIsApplePlatform() ? MAC_MODIFIER : DEFAULT_MODIFIER;
}

export function usePrimaryModifierKey(): Modifier {
  const [modifier, setModifier] = React.useState<Modifier>(DEFAULT_MODIFIER);

  React.useEffect(() => {
    setModifier(getPrimaryModifierKey());
  }, []);

  return modifier;
}
