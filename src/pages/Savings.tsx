import { useState, useMemo } from "react";
import { Plus, PiggyBank, Wallet, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AddSavingsPlanModal } from "@/components/savings/AddSavingsPlanModal";
import { SavingsPlanDetailModal } from "@/components/savings/SavingsPlanDetailModal";
import { SavingsCard } from "@/components/savings/SavingsCard";
import { useSavingsPlans, useAllInstallments, type SavingsPlan } from "@/hooks/use-savings";
import { formatAmount } from "@/lib/formatters";
import { useAppContext } from "@/contexts/AppContext";

export default function Savings() {
  const { currency } = useAppContext();
  const { data: plans = [], isLoading } = useSavingsPlans();
  const { data: allInstallments = [] } = useAllInstallments();
  const [addOpen, setAddOpen] = useState(false);
  const [detailPlan, setDetailPlan] = useState<SavingsPlan | null>(null);

  const stats = useMemo(() => {
    const totalSaved = plans.reduce((s, p) => s + Number(p.total_saved), 0);
    const completed = plans.filter(p => p.status === "completed").length;
    const today = new Date();
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    const monthStart = today.toISOString().slice(0, 10);
    const dueThisMonth = allInstallments
      .filter(i => i.status !== "paid" && i.due_date >= monthStart && i.due_date <= monthEnd)
      .reduce((s, i) => s + Number(i.amount), 0);
    return { totalPlans: plans.length, totalSaved, completed, dueThisMonth };
  }, [plans, allInstallments]);

  const nextDueByPlan = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const p of plans) {
      const next = allInstallments
        .filter(i => i.plan_id === p.id && i.status !== "paid")
        .sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
      map[p.id] = next?.due_date;
    }
    return map;
  }, [plans, allInstallments]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings"
        subtitle="Recurring deposits, DPS, foundation contributions, and more"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Plan
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<PiggyBank className="h-5 w-5 text-feature-savings" />} iconBg="bg-feature-savings/10"
          label="Total Plans" value={String(stats.totalPlans)} />
        <StatCard icon={<Wallet className="h-5 w-5 text-positive" />} iconBg="bg-positive/10"
          label="Total Saved" value={formatAmount(stats.totalSaved, currency)} />
        <StatCard icon={<Calendar className="h-5 w-5 text-warning" />} iconBg="bg-warning/10"
          label="Due This Month" value={formatAmount(stats.dueThisMonth, currency)} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-primary" />} iconBg="bg-primary/10"
          label="Completed" value={String(stats.completed)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="h-7 w-7 text-muted-foreground" />}
          title="No savings plans yet"
          description="Create a plan to track recurring deposits to a DPS, foundation, or committee."
          action={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create First Plan</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(p => (
            <SavingsCard key={p.id} plan={p} nextDue={nextDueByPlan[p.id]} onClick={() => setDetailPlan(p)} />
          ))}
        </div>
      )}

      <AddSavingsPlanModal open={addOpen} onOpenChange={setAddOpen} />
      <SavingsPlanDetailModal
        open={!!detailPlan}
        onOpenChange={(v) => !v && setDetailPlan(null)}
        plan={detailPlan}
      />
    </div>
  );
}
