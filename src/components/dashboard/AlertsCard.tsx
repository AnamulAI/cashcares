import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { mockAlerts } from "@/data/mock-data";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";

const alertIcons = {
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
  success: CheckCircle,
};

const alertStyles = {
  warning: { icon: "text-warning", bg: "bg-warning/10", border: "border-l-warning" },
  danger: { icon: "text-negative", bg: "bg-negative/10", border: "border-l-negative" },
  info: { icon: "text-primary", bg: "bg-primary/10", border: "border-l-primary" },
  success: { icon: "text-positive", bg: "bg-positive/10", border: "border-l-positive" },
};

export function AlertsCard() {
  const { t } = useTranslation();

  return (
    <div className="finance-card-static p-5">
      <SectionHeader title={t("dashboard.alertsReminders")} />
      <div className="mt-4 space-y-2.5">
        {mockAlerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          const style = alertStyles[alert.type];
          return (
            <div key={alert.id} className={cn("flex items-start gap-3 rounded-lg border-l-[3px] p-3", style.border, "bg-muted/30")}>
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", style.bg)}>
                <Icon className={cn("h-4 w-4", style.icon)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.description}</p>
              </div>
              {alert.date && <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap mt-0.5 font-medium">{alert.date}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
