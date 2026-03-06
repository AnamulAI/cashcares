import { format as fnsFormat, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { CurrencyOption } from "@/contexts/AppContext";

// --- Currency Formatting ---
export function formatAmount(amount: number, currency: CurrencyOption): string {
  return `${currency.symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// --- Date Format ---
const DATE_FORMAT_MAP: Record<string, string> = {
  dmy: "dd/MM/yyyy",
  mdy: "MM/dd/yyyy",
  ymd: "yyyy-MM-dd",
};

const TIMEZONE_MAP: Record<string, string> = {
  dhaka: "Asia/Dhaka",
  utc: "UTC",
  est: "America/New_York",
};

export function formatAppDate(
  dateInput: string | Date,
  dateFormat: string = "dmy",
  timezone: string = "dhaka"
): string {
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    const tz = TIMEZONE_MAP[timezone] || timezone;
    const pattern = DATE_FORMAT_MAP[dateFormat] || DATE_FORMAT_MAP.dmy;
    const zonedDate = toZonedTime(date, tz);
    return fnsFormat(zonedDate, pattern);
  } catch {
    // Fallback if date is invalid
    return typeof dateInput === "string" ? dateInput : dateInput.toLocaleDateString();
  }
}

export function formatAppDateTime(
  dateInput: string | Date,
  dateFormat: string = "dmy",
  timezone: string = "dhaka"
): string {
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    const tz = TIMEZONE_MAP[timezone] || timezone;
    const pattern = DATE_FORMAT_MAP[dateFormat] || DATE_FORMAT_MAP.dmy;
    const zonedDate = toZonedTime(date, tz);
    return fnsFormat(zonedDate, `${pattern} HH:mm`);
  } catch {
    return typeof dateInput === "string" ? dateInput : dateInput.toLocaleString();
  }
}

// Re-export timezone map for other uses
export { TIMEZONE_MAP };
