import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme-mode");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("theme-mode", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggle: () => setMode((m) => (m === "light" ? "dark" : "light")),
      setMode,
    }),
    [mode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeModeProvider");
  return ctx;
}
