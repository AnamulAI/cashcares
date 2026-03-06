

# Cash Care — Premium Finance SaaS Web App

## Architecture Overview

A modular, premium finance SaaS app built with React + TypeScript + shadcn/ui + Tailwind CSS + Recharts. All data is mock/demo for now with clean separation for future Supabase integration.

```text
src/
├── config/
│   └── app.ts                    # App name, currency, branding constants
├── data/
│   └── mock-data.ts              # All mock data centralized
├── types/
│   └── finance.ts                # Shared TypeScript types
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx         # Shell: sidebar + header + content
│   │   ├── AppSidebar.tsx        # Left sidebar with nav groups
│   │   ├── AppHeader.tsx         # Top header bar
│   │   └── QuickAddModal.tsx     # Global "+ Add Record" modal
│   ├── dashboard/
│   │   ├── SummaryCards.tsx       # Top 5 stat cards
│   │   ├── SecondaryCards.tsx     # 6 smaller finance cards
│   │   ├── TrendChart.tsx        # Income vs Expense line chart
│   │   ├── DistributionChart.tsx  # Account distribution
│   │   ├── QuickActions.tsx      # Action buttons card
│   │   ├── AlertsCard.tsx        # Alerts & reminders
│   │   ├── RecentTransactions.tsx # Recent txn table
│   │   └── BudgetProgress.tsx    # Budget progress bars
│   ├── transactions/
│   │   ├── TransactionFilters.tsx
│   │   ├── TransactionTable.tsx
│   │   ├── AddIncomeModal.tsx
│   │   ├── AddExpenseModal.tsx
│   │   └── TransferModal.tsx
│   ├── accounts/
│   │   ├── AccountCards.tsx
│   │   ├── AccountSummary.tsx
│   │   ├── AddAccountModal.tsx
│   │   └── AccountDetails.tsx
│   ├── categories/
│   │   ├── CategoryList.tsx
│   │   ├── AddCategoryModal.tsx
│   │   └── DefaultCategories.tsx
│   └── shared/
│       ├── StatCard.tsx          # Reusable summary card
│       ├── FinanceCard.tsx       # Smaller finance info card
│       ├── StatusBadge.tsx       # Status chip
│       ├── EmptyState.tsx        # Empty state placeholder
│       ├── SectionHeader.tsx     # Section title + action
│       ├── FilterBar.tsx         # Reusable filter row
│       └── PageHeader.tsx        # Page title + subtitle + actions
├── pages/
│   ├── Index.tsx                 # Redirect to /dashboard
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Accounts.tsx
│   ├── Categories.tsx
│   └── ComingSoon.tsx            # Placeholder for future pages
```

## Design System Changes

### CSS Variables (index.css)
- Update to purple/indigo primary palette
- Soft light background (`--background: 240 20% 98%`)
- White cards, thin borders, larger radius (`--radius: 0.75rem`)
- Emerald for positive, soft red for negative, amber for warning
- Import Google fonts: Inter (body), plus Hind Siliguri for Bangla support

### Typography
- Headings: font-family with Google Sans / Product Sans fallback (via Inter as proxy since Google Sans isn't freely available — use `font-display` class)
- Body: Hind Siliguri with Latin fallback
- Add font imports in `index.html`

### Spacing & Visual Rules
- Cards: `shadow-sm` with `border` and `rounded-xl`
- Spacious padding (`p-6` on cards, `gap-6` between sections)
- Subtle icon background chips (colored circle behind icons)
- No heavy gradients — soft accent backgrounds only

## Routing (App.tsx)
Add routes:
- `/dashboard` — Dashboard
- `/transactions` — Transactions
- `/accounts` — Accounts
- `/categories` — Categories
- `/budgets`, `/reports`, `/assets`, `/investments`, `/receivables`, `/payables`, `/debt-loans`, `/settings`, `/subscription` — all go to ComingSoon
- `/` redirects to `/dashboard`

## App Shell

### Sidebar (AppSidebar.tsx)
- Uses shadcn Sidebar with `collapsible="icon"`
- Logo + app name from config
- Grouped nav sections:
  - **Overview**: Dashboard
  - **Money**: Transactions, Accounts, Categories, Budgets
  - **Tracking**: Receivables, Payables, Debt & Loans
  - **Wealth**: Assets, Investments
  - **Insights**: Reports
  - **System**: Settings, Subscription
- Coming-soon items styled with `opacity-50` and a small "Soon" badge
- Active state highlighting via NavLink

### Header (AppHeader.tsx)
- Page title + subtitle (passed via props or context)
- Search input (UI only)
- Currency indicator badge (e.g., "BDT ৳")
- Date range dropdown (UI only)
- Notification bell icon
- User avatar dropdown
- Primary CTA: "+ Add Record" button triggering QuickAddModal

### QuickAddModal
- Dialog with 3 tabs: Income, Expense, Transfer
- Clean form layouts matching the transaction modals

## Pages

### Dashboard
Seven sections (A–G) as specified, using Recharts for charts, mock data for all values. Two-column responsive grid for insight area. All widgets are separate components.

### Transactions
- PageHeader with action buttons
- FilterBar with dropdowns and search
- Tabs component for type filtering
- Data table with all specified columns
- Row action dropdown (View/Edit/Duplicate/Delete)
- Three modal forms (Income, Expense, Transfer) with all specified fields

### Accounts
- Summary cards row (4 cards)
- Filter tabs for account types
- Toggle between card grid and table view
- Account cards with all specified info
- Add/Edit Account modal with all fields
- Account Details sheet/drawer with tabbed sections

### Categories
- Group tabs (Income, Expense, Savings, etc.)
- Search + filter + sort row
- Category items as list cards with icon, color chip, usage count
- Add/Edit Category modal with icon picker, color picker, all fields
- Pre-populated default categories as mock data

## Mock Data (data/mock-data.ts)
Realistic BDT-denominated financial data:
- 5-6 accounts (cash, bank, bKash, savings)
- 20+ transactions across types
- 15+ categories with icons and colors
- Budget examples with progress percentages
- Alert/reminder items

## Config (config/app.ts)
```ts
export const APP_CONFIG = {
  name: "Cash Care",
  currency: { code: "BDT", symbol: "৳" },
  // Easy to change later
}
```

## Key Implementation Notes
- All components use shadcn/ui primitives (Card, Button, Dialog, Table, Tabs, Select, Badge, etc.)
- Recharts for charts (already installed)
- Lucide icons throughout
- Responsive: sidebar collapses on mobile, grids adapt, tables scroll horizontally
- No backend calls — pure frontend with mock state
- Modular structure so each future module (budgets, reports, etc.) plugs in easily

