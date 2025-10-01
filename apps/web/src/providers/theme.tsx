import { Theme, ThemeProviderContext } from "@/context/theme";
import { useEffect, useState } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    const updateTheme = (systemTheme?: "light" | "dark") => {
      root.classList.remove("light", "dark");

      let effectiveTheme: "light" | "dark" = "light";

      if (theme === "system") {
        effectiveTheme =
          systemTheme ||
          (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light");
      } else {
        effectiveTheme = theme;
      }

      root.classList.add(effectiveTheme);

      // Update theme-color meta tag for PWA status bar
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          effectiveTheme === "dark" ? "#2e2e2e" : "#fafafa"
        );
      }
    };

    updateTheme();

    // Listen for system theme changes when theme is set to "system"
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        updateTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
