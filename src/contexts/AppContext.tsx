import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";

// --- Currency ---
export interface CurrencyOption {
  code: string;
  symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "BDT", symbol: "৳" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
];

function loadCurrency(): CurrencyOption {
  try {
    const saved = localStorage.getItem("cc_currency");
    if (saved) {
      const parsed = JSON.parse(saved);
      const match = CURRENCIES.find(c => c.code === parsed.code);
      if (match) return match;
    }
  } catch {}
  return CURRENCIES[0];
}

// --- Date Range ---
export type DatePreset = "this_month" | "last_month" | "last_3_months" | "this_year" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export const presetLabel: Record<DatePreset, string> = {
  this_month: "This Month",
  last_month: "Last Month",
  last_3_months: "Last 3 Months",
  this_year: "This Year",
  custom: "Custom Range",
};

export function getPresetRange(preset: DatePreset): DateRange {
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

function loadDatePreset(): DatePreset {
  try {
    const saved = localStorage.getItem("cc_date_preset") as DatePreset | null;
    if (saved && presetLabel[saved]) return saved;
  } catch {}
  return "this_month";
}

function loadCustomRange(): DateRange | null {
  try {
    const saved = localStorage.getItem("cc_custom_range");
    if (saved) {
      const p = JSON.parse(saved);
      return { from: new Date(p.from), to: new Date(p.to) };
    }
  } catch {}
  return null;
}

// --- Notifications ---
export interface AppNotification {
  id: string;
  icon: string;
  color: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  { id: "1", icon: "AlertTriangle", color: "text-warning", title: "Budget threshold reached", desc: "Food & Dining is at 90% of limit", time: "2 min ago", read: false },
  { id: "2", icon: "Clock", color: "text-negative", title: "Receivable overdue", desc: "Invoice #1042 — ৳12,000 past due", time: "1 hour ago", read: false },
  { id: "3", icon: "DollarSign", color: "text-primary", title: "Payable due soon", desc: "Rent payment due in 3 days", time: "3 hours ago", read: false },
  { id: "4", icon: "ArrowUpRight", color: "text-positive", title: "New transaction added", desc: "Salary credited — ৳85,000", time: "Yesterday", read: true },
];

function loadNotifications(): AppNotification[] {
  try {
    const saved = localStorage.getItem("cc_notifications");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_NOTIFICATIONS;
}

// --- Context ---
interface AppContextValue {
  currency: CurrencyOption;
  setCurrency: (c: CurrencyOption) => void;
  datePreset: DatePreset;
  dateRange: DateRange;
  setDatePreset: (p: DatePreset) => void;
  setCustomRange: (r: DateRange) => void;
  datePresetLabel: string;
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Currency — persisted
  const [currency, setCurrencyState] = useState<CurrencyOption>(loadCurrency);
  const setCurrency = useCallback((c: CurrencyOption) => {
    setCurrencyState(c);
    localStorage.setItem("cc_currency", JSON.stringify(c));
  }, []);

  // Date range — persisted
  const initialPreset = loadDatePreset();
  const [datePreset, setDatePresetState] = useState<DatePreset>(initialPreset);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    if (initialPreset === "custom") {
      return loadCustomRange() || getPresetRange("this_month");
    }
    return getPresetRange(initialPreset);
  });

  const setDatePreset = useCallback((p: DatePreset) => {
    setDatePresetState(p);
    localStorage.setItem("cc_date_preset", p);
    if (p !== "custom") {
      setDateRange(getPresetRange(p));
      localStorage.removeItem("cc_custom_range");
    }
  }, []);

  const setCustomRange = useCallback((r: DateRange) => {
    setDatePresetState("custom");
    setDateRange(r);
    localStorage.setItem("cc_date_preset", "custom");
    localStorage.setItem("cc_custom_range", JSON.stringify({ from: r.from.toISOString(), to: r.to.toISOString() }));
  }, []);

  // Notifications — persisted
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);
  useEffect(() => {
    localStorage.setItem("cc_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      currency, setCurrency,
      datePreset, dateRange, setDatePreset, setCustomRange,
      datePresetLabel: presetLabel[datePreset],
      notifications, unreadCount, markRead, markAllRead,
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
