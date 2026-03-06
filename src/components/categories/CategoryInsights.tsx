import { Layers, TrendingUp, EyeOff, Target } from "lucide-react";
import { mockCategories } from "@/data/mock-data";

export function CategoryInsights() {
  const total = mockCategories.length;
  const inactive = mockCategories.filter(c => !c.isActive).length;
  const budgetEnabled = mockCategories.filter(c => c.usableInBudgets).length;
  const mostUsed = [...mockCategories].sort((a, b) => b.usageCount - a.usageCount)[0];

  const items = [
    { icon: Layers, label: "Total Categories", value: String(total), color: "text-primary bg-primary/10" },
    { icon: TrendingUp, label: "Most Used", value: mostUsed?.name || "—", color: "text-positive bg-positive/10" },
    { icon: EyeOff, label: "Inactive", value: String(inactive), color: "text-muted-foreground bg-muted" },
    { icon: Target, label: "Budget Enabled", value: String(budgetEnabled), color: "text-warning bg-warning/10" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(item => (
        <div key={item.label} className="finance-card-static p-4 flex items-center gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${item.color.split(" ")[1]}`}>
            <item.icon className={`h-4 w-4 ${item.color.split(" ")[0]}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
            <p className="text-sm font-bold font-display truncate">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
