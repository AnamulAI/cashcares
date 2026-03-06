import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FinanceCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
  iconBg?: string;
}

export function FinanceCard({ icon, label, value, className, iconBg = "bg-accent" }: FinanceCardProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm", className)}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold font-display tracking-tight">{value}</p>
      </div>
    </div>
  );
}
