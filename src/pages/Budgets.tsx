import { useState, useMemo } from "react";
import { Plus, PieChart, TrendingDown, AlertTriangle, Search, RotateCcw, ShieldCheck, Target, Gauge, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/use-categories";
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget, type DbBudget } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";
import { startOfMonth, endOfMonth, format, parseISO } from "date-fns";

function getStatus(spent: number, allocated: number, threshold: number) {
  const pct = allocated > 0 ? (spent / allocated) * 100 : 0;
  if (pct >= 100) return { label: "Over Limit", variant: "destructive" as const, color: "text-negative" };
  if (pct >= threshold) return { label: "Warning", variant: "secondary" as const, color: "text-warning" };
  return { label: "Safe", variant: "outline" as const, color: "text-positive" };
}

interface BudgetFormData {
  category_id: string;
  allocated_amount: string;
  alert_threshold: string;
  note: string;
  is_active: boolean;
}

const emptyForm: BudgetFormData = { category_id: "", allocated_amount: "", alert_threshold: "80", note: "", is_active: true };

export default function Budgets() {
  const { currency } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: categories = [] } = useCategories();
  const { data: budgetsRaw = [], isLoading } = useBudgets();
  const { data: transactionsRaw = [] } = useTransactions();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BudgetFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const expenseCategories = categories.filter(c => c.group === "expense" && c.usable_in_budgets);

  const spentByCategory = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const map: Record<string, number> = {};
    (transactionsRaw as any[]).forEach((t: any) => {
      if (t.type === "expense" && t.category_id && t.status === "completed") {
        const d = parseISO(t.date);
        if (d >= monthStart && d <= monthEnd) {
          map[t.category_id] = (map[t.category_id] || 0) + Number(t.amount);
        }
      }
    });
    return map;
  }, [transactionsRaw]);

  const budgets = budgetsRaw.map(b => ({
    ...b,
    spent: spentByCategory[b.category_id] || 0,
    categoryName: b.category?.name || "Unknown",
    categoryIcon: b.category?.icon || "Folder",
    categoryColor: b.category?.color || "#6366f1",
  }));

  const filtered = useMemo(() => {
    let result = budgets;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b => b.categoryName.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      result = result.filter(b => b.category_id === categoryFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter(b => {
        const s = getStatus(b.spent, b.allocated_amount, b.alert_threshold);
        return s.label.toLowerCase().replace(" ", "_") === statusFilter;
      });
    }
    return result;
  }, [budgets, search, statusFilter, categoryFilter]);

  const totalBudget = budgets.reduce((s, b) => s + Number(b.allocated_amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  const overLimit = budgets.filter(b => b.spent >= Number(b.allocated_amount)).length;

  const fmt = (n: number) => formatAmount(n, currency);

  const resetFilters = () => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); };

  const riskyBudgets = [...budgets].sort((a, b) => {
    const pctA = Number(a.allocated_amount) > 0 ? a.spent / Number(a.allocated_amount) : 0;
    const pctB = Number(b.allocated_amount) > 0 ? b.spent / Number(b.allocated_amount) : 0;
    return pctB - pctA;
  }).slice(0, 4);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (b: typeof budgets[0]) => {
    setEditingId(b.id);
    setForm({
      category_id: b.category_id,
      allocated_amount: String(b.allocated_amount),
      alert_threshold: String(b.alert_threshold),
      note: b.note || "",
      is_active: b.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.category_id || !form.allocated_amount) return;
    setSaving(true);
    try {
      const payload = {
        category_id: form.category_id,
        allocated_amount: Number(form.allocated_amount),
        alert_threshold: Number(form.alert_threshold) || 80,
        note: form.note || null,
        is_active: form.is_active,
        period_type: "monthly",
        start_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      };
      if (editingId) {
        await updateBudget.mutateAsync({ id: editingId, ...payload });
      } else {
        await createBudget.mutateAsync(payload as any);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteBudget.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("budgets.title")}
        subtitle={t("budgets.subtitle")}
        actions={<Button size="sm" className="gap-1.5 h-9" onClick={openCreate}><Plus className="h-4 w-4" /> {t("action.createBudget")}</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <FinanceCard icon={<Target className="h-5 w-5 text-primary" />} label={t("budgets.totalBudget")} value={fmt(totalBudget)} iconBg="bg-primary/10" />
        <FinanceCard icon={<TrendingDown className="h-5 w-5 text-negative" />} label={t("budgets.totalSpent")} value={fmt(totalSpent)} iconBg="bg-negative/10" />
        <FinanceCard icon={<ShieldCheck className="h-5 w-5 text-positive" />} label={t("budgets.remaining")} value={fmt(remaining)} iconBg="bg-positive/10" />
        <FinanceCard icon={<PieChart className="h-5 w-5 text-primary" />} label={t("budgets.activeBudgets")} value={String(budgets.filter(b => b.is_active).length)} iconBg="bg-accent" />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-warning" />} label={t("budgets.overLimit")} value={String(overLimit)} iconBg="bg-warning/10" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder={t("budgets.searchBudgets")} className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder={t("table.category")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("budgets.allCategories")}</SelectItem>
            {budgets.map(b => <SelectItem key={b.category_id} value={b.category_id}>{b.categoryName}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder={t("table.status")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("budgets.allStatus")}</SelectItem>
            <SelectItem value="safe">{t("budgets.safe")}</SelectItem>
            <SelectItem value="warning">{t("budgets.warning")}</SelectItem>
            <SelectItem value="over_limit">{t("budgets.overLimitStatus")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={resetFilters}><RotateCcw className="h-3 w-3" /> {t("action.reset")}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">{t("common.loading")}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={t("budgets.noFound")}
              description={t("budgets.addFirst")}
              icon={<PieChart className="h-7 w-7 text-muted-foreground" />}
              action={<Button size="sm" onClick={openCreate}>{t("action.createBudget")}</Button>}
            />
          ) : (
            filtered.map(b => {
              const alloc = Number(b.allocated_amount);
              const pct = alloc > 0 ? Math.min(Math.round((b.spent / alloc) * 100), 120) : 0;
              const status = getStatus(b.spent, alloc, b.alert_threshold);
              const remainAmt = alloc - b.spent;
              return (
                <div key={b.id} className="finance-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: b.categoryColor + "18" }}>
                        <span className="text-sm">{b.categoryIcon?.startsWith?.("") ? b.categoryIcon : "📊"}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{b.categoryName}</p>
                        <p className="text-xs text-muted-foreground">{fmt(b.spent)} {t("common.of")} {fmt(alloc)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={status.variant} className="text-[10px] px-2 py-0.5">{status.label}</Badge>
                      <span className={`text-sm font-bold ${status.color}`}>{remainAmt >= 0 ? fmt(remainAmt) : `-${fmt(Math.abs(remainAmt))}`}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-negative" onClick={() => setDeleteId(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <div className="mt-3 relative">
                    <Progress value={Math.min(pct, 100)} className="h-2" />
                    <div className="absolute top-0 h-2 w-0.5 bg-foreground/30 rounded-full" style={{ left: `${b.alert_threshold}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{pct}% {t("budgets.used")}</span>
                    <span className="text-[10px] text-muted-foreground">{t("budgets.threshold")}: {b.alert_threshold}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> {t("budgets.budgetSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("budgets.overallUtilization")}</span>
                <span className="font-semibold">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</span>
              </div>
              <Progress value={totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0} className="h-2" />
              <div className="border-t pt-3 mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">{t("budgets.topRiskCategories")}</p>
                {riskyBudgets.length === 0 && <p className="text-xs text-muted-foreground">{t("budgets.noBudgetsYet")}</p>}
                {riskyBudgets.map(b => {
                  const alloc = Number(b.allocated_amount);
                  const pct = alloc > 0 ? Math.round((b.spent / alloc) * 100) : 0;
                  return (
                    <div key={b.id} className="flex items-center justify-between py-1.5">
                      <span className="text-xs truncate">{b.categoryName}</span>
                      <span className={`text-xs font-semibold ${pct >= 100 ? "text-negative" : pct >= 80 ? "text-warning" : "text-positive"}`}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{t("budgets.quickTips")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">• Set threshold alerts at 75–80% to catch overspending early.</p>
              <p className="text-xs text-muted-foreground leading-relaxed">• Review budgets monthly and adjust based on trends.</p>
              <p className="text-xs text-muted-foreground leading-relaxed">• Categories exceeding limits 3 months in a row need re-evaluation.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? t("budgets.editBudget") : t("action.createBudget")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("budgets.category")}</Label>
              <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={t("budgets.selectCategory")} /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                  {expenseCategories.length === 0 && (
                    <SelectItem value="_none" disabled>No budget categories</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("budgets.allocatedAmount")}</Label>
                <Input type="number" placeholder="0" className="h-9 text-sm" value={form.allocated_amount} onChange={e => setForm(f => ({ ...f, allocated_amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("budgets.alertThreshold")}</Label>
                <Input type="number" placeholder="80" className="h-9 text-sm" value={form.alert_threshold} onChange={e => setForm(f => ({ ...f, alert_threshold: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("table.note")}</Label>
              <Textarea placeholder="Optional note..." className="text-sm resize-none" rows={2} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>{t("action.cancel")}</Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !form.category_id || !form.allocated_amount}>
              {saving ? t("common.saving") : editingId ? t("action.update") : t("action.createBudget")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("budgets.deleteBudget")}</AlertDialogTitle>
            <AlertDialogDescription>{t("budgets.deleteConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("action.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("action.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
