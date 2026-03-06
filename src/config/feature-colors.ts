/**
 * Feature Color System
 * Each module has a distinct, intentional color identity.
 * Use these tokens for icons, icon backgrounds, and feature-specific accents.
 * 
 * Colors reference CSS variables defined in index.css under --feature-* tokens.
 * Tailwind classes are mapped in tailwind.config.ts.
 */

export const FEATURE_COLORS = {
  // Core financial actions
  income: {
    icon: "text-feature-income",
    iconBg: "bg-feature-income/10",
    accent: "text-feature-income",
  },
  expense: {
    icon: "text-feature-expense",
    iconBg: "bg-feature-expense/10",
    accent: "text-feature-expense",
  },
  savings: {
    icon: "text-feature-savings",
    iconBg: "bg-feature-savings/10",
    accent: "text-feature-savings",
  },

  // Planning & tracking
  budget: {
    icon: "text-feature-budget",
    iconBg: "bg-feature-budget/10",
    accent: "text-feature-budget",
  },
  accounts: {
    icon: "text-feature-accounts",
    iconBg: "bg-feature-accounts/10",
    accent: "text-feature-accounts",
  },
  categories: {
    icon: "text-feature-categories",
    iconBg: "bg-feature-categories/10",
    accent: "text-feature-categories",
  },
  transactions: {
    icon: "text-feature-transactions",
    iconBg: "bg-feature-transactions/10",
    accent: "text-feature-transactions",
  },

  // Receivables & Payables
  receivables: {
    icon: "text-feature-receivables",
    iconBg: "bg-feature-receivables/10",
    accent: "text-feature-receivables",
  },
  payables: {
    icon: "text-feature-payables",
    iconBg: "bg-feature-payables/10",
    accent: "text-feature-payables",
  },

  // Wealth
  debtLoans: {
    icon: "text-feature-debt",
    iconBg: "bg-feature-debt/10",
    accent: "text-feature-debt",
  },
  assets: {
    icon: "text-feature-assets",
    iconBg: "bg-feature-assets/10",
    accent: "text-feature-assets",
  },
  investments: {
    icon: "text-feature-investments",
    iconBg: "bg-feature-investments/10",
    accent: "text-feature-investments",
  },

  // Insights
  reports: {
    icon: "text-feature-reports",
    iconBg: "bg-feature-reports/10",
    accent: "text-feature-reports",
  },
  reminders: {
    icon: "text-feature-reminders",
    iconBg: "bg-feature-reminders/10",
    accent: "text-feature-reminders",
  },

  // Partnerships
  partnerships: {
    icon: "text-feature-partnerships",
    iconBg: "bg-feature-partnerships/10",
    accent: "text-feature-partnerships",
  },

  // System
  settings: {
    icon: "text-feature-settings",
    iconBg: "bg-feature-settings/10",
    accent: "text-feature-settings",
  },
  subscription: {
    icon: "text-feature-subscription",
    iconBg: "bg-feature-subscription/10",
    accent: "text-feature-subscription",
  },
} as const;
