import { useState, useMemo } from "react";
import {
  Plus, PiggyBank, Wallet, CheckCircle2, Calendar, Search, RotateCcw,
  MoreHorizontal, Pencil, Trash2, Eye, Pause, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { BulkActionBar } from "@/components/shared/BulkActionBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { AddSavingsPlanModal } from "@/components/savings/AddSavingsPlanModal";
import { SavingsPlanDetailModal } from "@/components/savings/SavingsPlanDetailModal";
import {
  useSavingsPlans, useAllInstallments, useDeleteSavingsPlan, useUpdateSavingsPlan,
  type SavingsPlan
} from "@/hooks/use-savings";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { useAppContext } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  paused: "bg-warning/10 text-warning",
  completed: "bg-positive/10 text-positive",
};

export default function Savings() {
  const { currency } = useAppContext();
  const { data: plans = [], isLoading } = useSavingsPlans();
  const { data: allInstallments = [] } = useAllInstallments();
  const del = useDeleteSavingsPlan();
  const upd = useUpdateSavingsPlan();

  const [addOpen, setAddOpen] = useState(false);
  const [detailPlan, setDetailPlan] = useState<SavingsPlan | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const planAggregates = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const map: Record<string, { count: number; paid: number; pending: number; nextDue?: string; hasOverdue: boolean }> = {};
    for (const p of plans) {
      const ins = allInstallments.filter(i => i.plan_id === p.id);
      const next = ins.filter(i => i.status !== "paid").sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
      map[p.id] = {
        count: ins.length,
        paid: ins.filter(i => i.status === "paid").length,
        pending: ins.filter(i => i.status !== "paid").length,
        nextDue: next?.due_date,
        hasOverdue: ins.some(i => i.status !== "paid" && i.due_date < today),
      };
    }
    return map;
  }, [plans, allInstallments]);

  const filtered = useMemo(() => plans.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.plan_name.toLowerCase().includes(q) && !(p.recipient_name || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [plans, statusFilter, search]);

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id)));
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      for (const id of selected) {
        await (supabase as any).from("savings_plans").delete().eq("id", id);
      }
      window.location.reload();
    } finally { setBulkDeleting(false); }
  };

  const fmt = (n: number) => formatAmount(n, currency);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings"
        subtitle="Recurring deposits, DPS, foundation contributions, and more"
        actions={
          <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> New Plan
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<PiggyBank className="h-5 w-5 text-feature-savings" />} iconBg="bg-feature-savings/10"
          label="Total Plans" value={String(stats.totalPlans)} />
        <StatCard icon={<Wallet className="h-5 w-5 text-positive" />} iconBg="bg-positive/10"
          label="Total Saved" value={fmt(stats.totalSaved)} />
        <StatCard icon={<Calendar className="h-5 w-5 text-warning" />} iconBg="bg-warning/10"
          label="Due This Month" value={fmt(stats.dueThisMonth)} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-primary" />} iconBg="bg-primary/10"
          label="Completed" value={String(stats.completed)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search plan/recipient..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all") && (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
        {filtered.length > 0 && (
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={selected.size === filtered.length && filtered.length > 0}
              onCheckedChange={toggleAll}
            />
            <span>Select all</span>
          </div>
        )}
      </div>

      <BulkActionBar
        selectedCount={selected.size}
        onDelete={() => setBulkDeleteOpen(true)}
        onClear={() => setSelected(new Set())}
        deleting={bulkDeleting}
      />

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="h-7 w-7 text-muted-foreground" />}
          title={plans.length === 0 ? "No savings plans yet" : "No plans match your filters"}
          description={plans.length === 0
            ? "Create a plan to track recurring deposits to a DPS, foundation, or committee."
            : "Try adjusting search or status filter."}
          action={plans.length === 0 ? (
            <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create First Plan</Button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(plan => {
            const agg = planAggregates[plan.id] || { count: 0, paid: 0, pending: 0, hasOverdue: false };
            const target = Number(plan.target_amount);
            const saved = Number(plan.total_saved);
            const remaining = Math.max(0, target - saved);
            return (
              <Card
                key={plan.id}
                className="finance-card-static p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setDetailPlan(plan)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selected.has(plan.id)}
                    onCheckedChange={() => toggleOne(plan.id)}
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-feature-savings/10">
                    <PiggyBank className="h-5 w-5 text-feature-savings" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold truncate">{plan.plan_name}</h3>
                      <Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[plan.status] || ""}`}>
                        {plan.status}
                      </Badge>
                      {agg.hasOverdue && (
                        <Badge variant="secondary" className="text-[10px] bg-negative/10 text-negative">Overdue</Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {plan.plan_type === "fixed" ? "Fixed" : "Open-ended"}
                      </Badge>
                    </div>
                    {plan.recipient_name && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{plan.recipient_name}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {agg.count} installments · {plan.frequency}
                      {agg.nextDue && ` · Next due ${formatAppDate(agg.nextDue)}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs text-muted-foreground">
                      {plan.plan_type === "fixed" ? `Target: ${fmt(target)}` : "Open-ended"}
                    </p>
                    <p className="text-xs text-positive">Saved: {fmt(saved)}</p>
                    <p className="text-sm font-bold mt-0.5">
                      {plan.plan_type === "fixed" ? `Remaining: ${fmt(remaining)}` : `Saved: ${fmt(saved)}`}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); setDetailPlan(plan); }}>
                        <Eye className="h-3.5 w-3.5 mr-2" /> Open Plan
                      </DropdownMenuItem>
                      {plan.status !== "completed" && (
                        <DropdownMenuItem onClick={e => {
                          e.stopPropagation();
                          upd.mutate({ id: plan.id, status: plan.status === "paused" ? "active" : "paused" });
                        }}>
                          {plan.status === "paused" ? <Play className="h-3.5 w-3.5 mr-2" /> : <Pause className="h-3.5 w-3.5 mr-2" />}
                          {plan.status === "paused" ? "Resume" : "Pause"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); setDeleteId(plan.id); }}>
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddSavingsPlanModal open={addOpen} onOpenChange={setAddOpen} />
      <SavingsPlanDetailModal
        open={!!detailPlan}
        onOpenChange={(v) => !v && setDetailPlan(null)}
        plan={detailPlan}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete this savings plan?"
        description="This will permanently delete the plan and all its installments. Account balances are not refunded."
        onConfirm={() => { if (deleteId) del.mutate(deleteId); setDeleteId(null); }}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected savings plans?"
        description={`This will permanently delete ${selected.size} plan(s) and their installments.`}
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
      />
    </div>
  );
}
