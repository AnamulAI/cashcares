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
    <div className={cn("finance-card flex items-center gap-3.5 p-4", className)}>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide truncate">{label}</p>
        <p className="text-lg font-bold font-display tracking-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}