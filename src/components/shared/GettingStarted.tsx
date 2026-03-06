import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Wallet2, FolderOpen, FileText, PieChart, BarChart3, X, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";

interface Step {
  key: string;
  icon: React.ElementType;
  label: string;
  description: string;
  route: string;
  done: boolean;
}

export function GettingStarted() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { data: transactions = [] } = useTransactions();
  const { data: budgets = [] } = useBudgets();

  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("cc_onboarding_dismissed") === "true"; } catch { return false; }
  });

  const steps: Step[] = [
    { key: "account", icon: Wallet2, label: t("onboarding.addAccount"), description: t("onboarding.addAccountDesc"), route: "/accounts", done: accounts.length > 0 },
    { key: "category", icon: FolderOpen, label: t("onboarding.createCategory"), description: t("onboarding.createCategoryDesc"), route: "/categories", done: categories.length > 0 },
    { key: "transaction", icon: FileText, label: t("onboarding.recordTransaction"), description: t("onboarding.recordTransactionDesc"), route: "/transactions", done: transactions.length > 0 },
    { key: "budget", icon: PieChart, label: t("onboarding.setBudget"), description: t("onboarding.setBudgetDesc"), route: "/budgets", done: budgets.length > 0 },
    { key: "reports", icon: BarChart3, label: t("onboarding.exploreReports"), description: t("onboarding.exploreReportsDesc"), route: "/reports", done: false },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount >= 4; // reports doesn't count
  const pct = Math.round((completedCount / steps.length) * 100);

  useEffect(() => {
    if (allDone && !dismissed) {
      // Auto-dismiss after all core steps done
    }
  }, [allDone, dismissed]);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("cc_onboarding_dismissed", "true");
  };

  return (
    <Card className="finance-card-static border-primary/20 bg-gradient-to-br from-card to-accent/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("onboarding.title")}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={handleDismiss}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t("onboarding.subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Progress value={pct} className="h-2 flex-1" />
          <span className="text-xs font-medium text-muted-foreground shrink-0">{completedCount}/{steps.length}</span>
        </div>
        <div className="space-y-2">
          {steps.map(step => (
            <button
              key={step.key}
              onClick={() => navigate(step.route)}
              className="flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-colors hover:bg-accent/50 group"
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-positive shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-primary/60" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-medium ${step.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{step.description}</p>
              </div>
              <step.icon className={`h-3.5 w-3.5 shrink-0 ${step.done ? "text-muted-foreground/30" : "text-muted-foreground/60"}`} />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
