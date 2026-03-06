import { Wallet, Building2, Smartphone, Briefcase } from "lucide-react";
import { formatCurrency } from "@/config/app";
import { mockAccounts } from "@/data/mock-data";

export function AccountSummary() {
  const active = mockAccounts.filter(a => a.isActive);
  const cash = mockAccounts.filter(a => a.type === "cash").reduce((s, a) => s + a.balance, 0);
  const bank = mockAccounts.filter(a => a.type === "bank" || a.type === "savings").reduce((s, a) => s + a.balance, 0);
  const wallet = mockAccounts.filter(a => a.type === "mobile_wallet").reduce((s, a) => s + a.balance, 0);

  const items = [
    { icon: Briefcase, label: "Active Accounts", value: String(active.length), sub: "All accounts healthy", color: "text-primary bg-primary/10" },
    { icon: Wallet, label: "Total Cash", value: formatCurrency(cash), color: "text-positive bg-positive/10" },
    { icon: Building2, label: "Bank Balance", value: formatCurrency(bank), color: "text-primary bg-primary/10" },
    { icon: Smartphone, label: "Wallet Balance", value: formatCurrency(wallet), color: "text-warning bg-warning/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.label} className="finance-card-static p-5">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${item.color.split(" ")[1]}`}>
              <item.icon className={`h-5 w-5 ${item.color.split(" ")[0]}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-muted-foreground font-medium">{item.label}</p>
              <p className="text-xl font-bold font-display tracking-tight tabular-nums mt-0.5">{item.value}</p>
              {item.sub && <p className="text-xs text-positive mt-0.5">{item.sub}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
