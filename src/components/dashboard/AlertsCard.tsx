import { AlertTriangle, AlertCircle, Info, CheckCircle, Bell } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";
import { useReminders } from "@/hooks/use-reminders";
import { useBudgets } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";
import { useAllInstallments, useSavingsPlans } from "@/hooks/use-savings";
import { useAppContext } from "@/contexts/AppContext";
import { formatAppDateAuto } from "@/lib/formatters";
import { useMemo } from "react";

interface AlertItem {
  id: string;
  type: "warning" | "danger" | "info" | "success";
  title: string;
  description: string;
  date?: string;
}

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
  const { t, lang } = useTranslation();
  const { settings } = useAppContext();
  const { data: reminders = [] } = useReminders();
  const { data: budgets = [] } = useBudgets();
  const { data: transactions = [] } = useTransactions();
  const { data: installments = [] } = useAllInstallments();
  const { data: plans = [] } = useSavingsPlans();

  const fmtDate = (d: string) => formatAppDateAuto(d, { dateFormat: settings.dateFormat, timezone: settings.timezone, lang, relative: settings.relativeTime });

  const alerts: AlertItem[] = useMemo(() => {
    const items: AlertItem[] = [];
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    // Budget alerts
    budgets.filter(b => b.is_active).forEach(b => {
      const spent = (transactions as any[])
        .filter(txn => txn.type === "expense" && txn.category_id === b.category_id && txn.date >= monthStart)
        .reduce((s: number, txn: any) => s + Number(txn.amount), 0);
      const limit = Number(b.allocated_amount);
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const name = b.category?.name || "Budget";

      if (pct >= 100) {
        items.push({ id: `budget-over-${b.id}`, type: "danger", title: `${name} budget exceeded`, description: `Spent ${pct}% of limit` });
      } else if (pct >= (b.alert_threshold || 80)) {
        items.push({ id: `budget-warn-${b.id}`, type: "warning", title: `${name} budget at ${pct}%`, description: `Approaching limit` });
      }
    });

    // Reminder alerts (upcoming/overdue)
    reminders.filter(r => r.status !== "completed" && r.status !== "dismissed").forEach(r => {
      const isOverdue = r.due_date < today;
      items.push({
        id: `rem-${r.id}`,
        type: isOverdue ? "danger" : "info",
        title: r.title,
        description: r.note || (isOverdue ? "Overdue" : `Due ${fmtDate(r.due_date)}`),
        date: r.due_date,
      });
    });

    // Savings installment alerts (overdue or due within 7 days)
    const sevenDaysOut = new Date(now);
    sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);
    const sevenStr = sevenDaysOut.toISOString().slice(0, 10);
    const planMap = new Map(plans.map(p => [p.id, p]));
    installments
      .filter(i => i.status !== "paid" && i.due_date <= sevenStr)
      .forEach(i => {
        const plan = planMap.get(i.plan_id);
        if (!plan || plan.status !== "active") return;
        const isOverdue = i.due_date < today;
        items.push({
          id: `sav-${i.id}`,
          type: isOverdue ? "danger" : "info",
          title: isOverdue ? `${plan.plan_name} installment overdue` : `${plan.plan_name} installment due`,
          description: `Due ${fmtDate(i.due_date)}`,
          date: i.due_date,
        });
      });

    // Sort: danger first, then warning, then info
    const priority: Record<string, number> = { danger: 0, warning: 1, info: 2, success: 3 };
    items.sort((a, b) => (priority[a.type] ?? 9) - (priority[b.type] ?? 9));

    return items.slice(0, 6);
  }, [reminders, budgets, transactions, installments, plans, settings.dateFormat, settings.timezone, settings.relativeTime, lang]);

  return (
    <div className="finance-card-static finance-card-hover p-5">
      <SectionHeader title={t("dashboard.alertsReminders")} />
      <div className="mt-4 space-y-2.5">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">{t("common.noData") || "No alerts right now"}</p>
          </div>
        ) : (
          alerts.map((alert) => {
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
                {alert.date && <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap mt-0.5 font-medium">{fmtDate(alert.date)}</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
