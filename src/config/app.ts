export const APP_CONFIG = {
  name: "Cash Care",
  tagline: "Smart Money Management",
  currency: {
    code: "BDT",
    symbol: "৳",
    locale: "bn-BD",
  },
} as const;

export function formatCurrency(amount: number): string {
  return `${APP_CONFIG.currency.symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
