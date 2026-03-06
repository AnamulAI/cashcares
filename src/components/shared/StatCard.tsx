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
  prominent?: boolean;
}

export function StatCard({ icon, label, value, trend, trendType = "neutral", className, iconBg = "bg-accent", prominent }: StatCardProps) {
  return (
    <div className={cn(
      "finance-card p-5",
      prominent && "ring-1 ring-primary/10",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
          {icon}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-[13px] text-muted-foreground font-medium">{label}</p>
        <p className={cn(
          "font-bold font-display tracking-tight",
          prominent ? "text-[28px] leading-8" : "text-2xl"
        )}>{value}</p>
        {trend && (
          <p className={cn(
            "text-xs font-medium pt-0.5",
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