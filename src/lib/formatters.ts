import { format as fnsFormat, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { CurrencyOption } from "@/contexts/AppContext";

// --- Bangla Numeral Conversion ---
const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => BANGLA_DIGITS[parseInt(d)]);
}

// --- Currency Formatting ---
export function formatAmount(amount: number, currency: CurrencyOption, lang: string = "en"): string {
  const formatted = `${currency.symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
  return lang === "bn" ? toBanglaDigits(formatted) : formatted;
}

/** Format a plain number (no currency) with optional Bangla digits */
export function formatNumber(value: number | string, lang: string = "en"): string {
  const str = typeof value === "number"
    ? value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : String(value);
  return lang === "bn" ? toBanglaDigits(str) : str;
}

/** Format a percentage with optional Bangla digits */
export function formatPercent(value: number, lang: string = "en"): string {
  const str = `${Math.round(value)}%`;
  return lang === "bn" ? toBanglaDigits(str) : str;
}

// --- Date Format ---
const DATE_FORMAT_MAP: Record<string, string> = {
  dmy: "dd MMM, yyyy",
  mdy: "MMM dd, yyyy",
  ymd: "yyyy MMM dd",
};

const TIMEZONE_MAP: Record<string, string> = {
  dhaka: "Asia/Dhaka",
  utc: "UTC",
  est: "America/New_York",
};

export function formatAppDate(
  dateInput: string | Date,
  dateFormat: string = "dmy",
  timezone: string = "dhaka",
  lang: string = "en"
): string {
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    const tz = TIMEZONE_MAP[timezone] || timezone;
    const pattern = DATE_FORMAT_MAP[dateFormat] || DATE_FORMAT_MAP.dmy;
    const zonedDate = toZonedTime(date, tz);
    const result = fnsFormat(zonedDate, pattern);
    return lang === "bn" ? toBanglaDigits(result) : result;
  } catch {
    return typeof dateInput === "string" ? dateInput : dateInput.toLocaleDateString();
  }
}

export function formatAppDateTime(
  dateInput: string | Date,
  dateFormat: string = "dmy",
  timezone: string = "dhaka",
  lang: string = "en"
): string {
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    const tz = TIMEZONE_MAP[timezone] || timezone;
    const pattern = DATE_FORMAT_MAP[dateFormat] || DATE_FORMAT_MAP.dmy;
    const zonedDate = toZonedTime(date, tz);
    const result = fnsFormat(zonedDate, `${pattern} HH:mm`);
    return lang === "bn" ? toBanglaDigits(result) : result;
  } catch {
    return typeof dateInput === "string" ? dateInput : dateInput.toLocaleString();
  }
}

// Re-export timezone map for other uses
export { TIMEZONE_MAP };
