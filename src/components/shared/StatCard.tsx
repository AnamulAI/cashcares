import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  className?: string;
  iconBg?: string;
}

export function StatCard({ icon, label, value, trend, trendType = "neutral", className, iconBg = "bg-accent" }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg)}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold font-display tracking-tight">{value}</p>
        {trend && (
          <p className={cn(
            "mt-1 text-xs font-medium",
            trendType === "positive" && "text-positive",
            trendType === "negative" && "text-negative",
            trendType === "neutral" && "text-muted-foreground"
          )}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
