import React, { createContext, useContext, useState, ReactNode } from "react";
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";

export interface CurrencyOption {
  code: string;
  symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "BDT", symbol: "৳" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
];

export type DatePreset = "this_month" | "last_month" | "last_3_months" | "this_year" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

const presetLabel: Record<DatePreset, string> = {
  this_month: "This Month",
  last_month: "Last Month",
  last_3_months: "Last 3 Months",
  this_year: "This Year",
  custom: "Custom Range",
};

function getPresetRange(preset: DatePreset): DateRange {
  const now = new Date();
  switch (preset) {
    case "last_month": {
      const lm = subMonths(now, 1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    }
    case "last_3_months":
      return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) };
    case "this_year":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "this_month":
    default:
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

interface AppContextValue {
  currency: CurrencyOption;
  setCurrency: (c: CurrencyOption) => void;
  datePreset: DatePreset;
  dateRange: DateRange;
  setDatePreset: (p: DatePreset) => void;
  setCustomRange: (r: DateRange) => void;
  datePresetLabel: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyOption>(CURRENCIES[0]);
  const [datePreset, setDatePresetState] = useState<DatePreset>("this_month");
  const [dateRange, setDateRange] = useState<DateRange>(getPresetRange("this_month"));

  const setDatePreset = (p: DatePreset) => {
    setDatePresetState(p);
    if (p !== "custom") setDateRange(getPresetRange(p));
  };

  const setCustomRange = (r: DateRange) => {
    setDatePresetState("custom");
    setDateRange(r);
  };

  return (
    <AppContext.Provider value={{
      currency, setCurrency,
      datePreset, dateRange, setDatePreset, setCustomRange,
      datePresetLabel: presetLabel[datePreset],
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

export { presetLabel, getPresetRange };
