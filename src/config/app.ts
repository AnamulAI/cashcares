export const APP_CONFIG = {
  name: "MahBook",
  tagline: "Personal Finance, Refined",
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
