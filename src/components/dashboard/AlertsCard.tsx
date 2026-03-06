import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { mockAlerts } from "@/data/mock-data";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

const alertIcons = {
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
  success: CheckCircle,
};

const alertStyles = {
  warning: "text-warning bg-warning/10",
  danger: "text-negative bg-negative/10",
  info: "text-primary bg-primary/10",
  success: "text-positive bg-positive/10",
};

export function AlertsCard() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <SectionHeader title="Alerts & Reminders" />
      <div className="mt-4 space-y-3">
        {mockAlerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          return (
            <div key={alert.id} className="flex items-start gap-3">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", alertStyles[alert.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
              </div>
              {alert.date && <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{alert.date}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
