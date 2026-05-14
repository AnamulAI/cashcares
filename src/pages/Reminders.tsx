import { useState, useMemo } from "react";
import { Plus, Bell, AlertTriangle, CheckCircle2, Clock, CalendarClock, Search, RotateCcw, Trash2, Pencil, AlarmClockOff, Check } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FeatureIO } from "@/components/shared/FeatureIO";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BulkActionBar } from "@/components/shared/BulkActionBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReminders, useCreateReminder, useUpdateReminder, useDeleteReminder, ReminderInsert } from "@/hooks/use-reminders";
import { useReceivables } from "@/hooks/use-receivables";
import { usePayables } from "@/hooks/use-payables";
import { useLoans } from "@/hooks/use-loans";
import { useAllInstallments, useSavingsPlans } from "@/hooks/use-savings";
import { useTranslation } from "@/i18n/useTranslation";
import { parseISO, isToday, isBefore, addDays, isWithinInterval, startOfDay, endOfDay, format } from "date-fns";
import { useAppContext } from "@/contexts/AppContext";
import { formatAppDate } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  upcoming: "bg-primary/10 text-primary",
  "due today": "bg-warning/10 text-warning",
  completed: "bg-positive/10 text-positive",
  overdue: "bg-negative/10 text-negative",
  snoozed: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  high: "bg-negative/10 text-negative",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
};

const REMINDER_TYPES = ["budget_alert", "receivable_followup", "payable_due", "loan_due", "savings_due", "credit_card_due", "custom"];

export default function Reminders() {
  const { t, lang } = useTranslation();
  const { settings } = useAppContext();
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);
  const { data: reminders = [], isLoading } = useReminders();
  const { data: receivables = [] } = useReceivables();
  const { data: payables = [] } = usePayables();
  const { data: loans = [] } = useLoans();
  const { data: savingsInstallments = [] } = useAllInstallments();
  const { data: savingsPlans = [] } = useSavingsPlans();
  const createMut = useCreateReminder();
  const updateMut = useUpdateReminder();
  const deleteMut = useDeleteReminder();
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [form, setForm] = useState({ title: "", reminder_type: "custom", due_date: "", related_entity_id: "", related_module: "", priority: "medium", note: "", status: "upcoming" });

  const now = new Date();
  const weekEnd = addDays(now, 7);

  const autoReminders = useMemo(() => {
    const auto: Array<{ title: string; type: string; due_date: string; module: string; status: string; priority: string; id: string }> = [];
    (receivables as any[]).filter(r => r.status !== "collected" && r.due_date).forEach(r => {
      const due = parseISO(r.due_date);
      const status = isBefore(due, startOfDay(now)) ? "overdue" : isToday(due) ? "due today" : "upcoming";
      auto.push({ id: `auto-recv-${r.id}`, title: `Receivable: ${r.person_name}`, type: "receivable_followup", due_date: r.due_date, module: "receivables", status, priority: status === "overdue" ? "high" : "medium" });
    });
    (payables as any[]).filter(p => p.status !== "paid" && p.due_date).forEach(p => {
      const due = parseISO(p.due_date);
      const status = isBefore(due, startOfDay(now)) ? "overdue" : isToday(due) ? "due today" : "upcoming";
      auto.push({ id: `auto-pay-${p.id}`, title: `Payable: ${p.person_name}`, type: "payable_due", due_date: p.due_date, module: "payables", status, priority: status === "overdue" ? "high" : "medium" });
    });
    (loans as any[]).filter(l => l.status !== "paid_off" && l.due_date).forEach(l => {
      const due = parseISO(l.due_date);
      const status = isBefore(due, startOfDay(now)) ? "overdue" : isToday(due) ? "due today" : "upcoming";
      auto.push({ id: `auto-loan-${l.id}`, title: `Loan: ${l.lender_name}`, type: "loan_due", due_date: l.due_date, module: "loans", status, priority: status === "overdue" ? "high" : "medium" });
    });
    // Savings installments — only show next unpaid per active plan within 30 days, plus all overdue
    const planMap = new Map((savingsPlans as any[]).map(p => [p.id, p]));
    const horizon = addDays(now, 30);
    const byPlan = new Map<string, any[]>();
    (savingsInstallments as any[])
      .filter(i => i.status !== "paid")
      .forEach(i => {
        const arr = byPlan.get(i.plan_id) || [];
        arr.push(i);
        byPlan.set(i.plan_id, arr);
      });
    byPlan.forEach((items, planId) => {
      const plan = planMap.get(planId);
      if (!plan || plan.status !== "active") return;
      items.sort((a, b) => a.due_date.localeCompare(b.due_date));
      items.forEach(i => {
        const due = parseISO(i.due_date);
        const isOverdue = isBefore(due, startOfDay(now));
        const isWithinHorizon = isWithinInterval(due, { start: startOfDay(now), end: endOfDay(horizon) });
        if (!isOverdue && !isWithinHorizon) return;
        const status = isOverdue ? "overdue" : isToday(due) ? "due today" : "upcoming";
        auto.push({
          id: `auto-savings-${i.id}`,
          title: `Savings: ${plan.plan_name}`,
          type: "savings_due",
          due_date: i.due_date,
          module: "savings",
          status,
          priority: isOverdue ? "high" : "medium",
        });
      });
    });
    return auto;
  }, [receivables, payables, loans, savingsInstallments, savingsPlans]);

  const processedReminders = useMemo(() => {
    return reminders.map(r => {
      if (r.status === "completed" || r.status === "snoozed") return r;
      const due = parseISO(r.due_date);
      if (isBefore(due, startOfDay(now))) return { ...r, status: "overdue" };
      if (isToday(due)) return { ...r, status: "due today" };
      return { ...r, status: "upcoming" };
    });
  }, [reminders]);

  const allItems = useMemo(() => {
    const combined = [
      ...processedReminders.map(r => ({ ...r, isAuto: false })),
      ...autoReminders.map(r => ({ ...r, isAuto: true, note: null, related_entity_id: null, related_module: r.module, reminder_type: r.type, created_at: "", updated_at: "" })),
    ];
    return combined.filter(r => {
      if (typeFilter !== "all" && r.reminder_type !== typeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [processedReminders, autoReminders, typeFilter, statusFilter, search]);

  // Only manual (non-auto) reminders can be bulk-selected
  const manualItems = allItems.filter(r => !r.isAuto);

  const activeCount = allItems.filter(r => r.status !== "completed").length;
  const dueTodayCount = allItems.filter(r => r.status === "due today").length;
  const upcomingWeekCount = allItems.filter(r => {
    if (!r.due_date) return false;
    const due = parseISO(r.due_date);
    return r.status !== "completed" && isWithinInterval(due, { start: startOfDay(now), end: endOfDay(weekEnd) });
  }).length;
  const overdueCount = allItems.filter(r => r.status === "overdue").length;

  const openModal = (item?: any) => {
    if (item && !item.isAuto) {
      setEditing(item);
      setForm({ title: item.title, reminder_type: item.reminder_type, due_date: item.due_date, related_entity_id: item.related_entity_id || "", related_module: item.related_module || "", priority: item.priority, note: item.note || "", status: item.status });
    } else {
      setEditing(null);
      setForm({ title: "", reminder_type: "custom", due_date: new Date().toISOString().slice(0, 10), related_entity_id: "", related_module: "", priority: "medium", note: "", status: "upcoming" });
    }
    setModal(true);
  };

  const handleSave = () => {
    const payload: ReminderInsert = {
      title: form.title, reminder_type: form.reminder_type, due_date: form.due_date,
      related_entity_id: form.related_entity_id || null, related_module: form.related_module || null,
      priority: form.priority, note: form.note || null, status: form.status,
    };
    if (editing) updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModal(false) });
    else createMut.mutate(payload, { onSuccess: () => setModal(false) });
  };

  const markComplete = (id: string) => updateMut.mutate({ id, status: "completed" });
  const snoozeReminder = (id: string) => {
    const newDate = addDays(now, 1).toISOString().slice(0, 10);
    updateMut.mutate({ id, due_date: newDate, status: "snoozed" });
  };

  const toggleAll = () => {
    if (selected.size === manualItems.length) setSelected(new Set());
    else setSelected(new Set(manualItems.map(r => r.id)));
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      for (const id of selected) { await (supabase as any).from("reminders").delete().eq("id", id); }
      qc.invalidateQueries({ queryKey: ["reminders"] });
      toast.success(t("bulk.deleteSuccess").replace("{count}", String(selected.size)));
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } finally { setBulkDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("reminders.title", "Reminder Center")}
        subtitle={t("reminders.subtitle", "Stay on top of dues, alerts, and follow-ups")}
        actions={<div className="flex items-center gap-2"><FeatureIO feature="reminders" tables={[{ table: "reminders" }]} /><Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Reminder</Button></div>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<Bell className="h-5 w-5 text-feature-reminders" />} iconBg="bg-feature-reminders/10" label="Active Reminders" value={String(activeCount)} />
        <FinanceCard icon={<CalendarClock className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label="Due Today" value={String(dueTodayCount)} />
        <FinanceCard icon={<Clock className="h-5 w-5 text-feature-reminders" />} iconBg="bg-feature-reminders/10" label="Upcoming This Week" value={String(upcomingWeekCount)} />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label="Overdue" value={String(overdueCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search reminders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {REMINDER_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="due today">Due Today</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="snoozed">Snoozed</SelectItem>
          </SelectContent>
        </Select>
        {(search || typeFilter !== "all" || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}><RotateCcw className="h-3 w-3" /> Reset</Button>}
      </div>

      <BulkActionBar selectedCount={selected.size} onDelete={() => setBulkDeleteOpen(true)} onClear={() => setSelected(new Set())} deleting={bulkDeleting} />

      {isLoading ? (
        <Card className="finance-card-static"><CardContent className="py-12 text-center text-sm text-muted-foreground">{t("common.loading")}</CardContent></Card>
      ) : allItems.length === 0 ? (
        <EmptyState icon="Bell" title="No reminders" description="Add a reminder or let the system auto-generate from your due items." action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> Add Reminder</Button>} />
      ) : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={manualItems.length > 0 && selected.size === manualItems.length} onCheckedChange={toggleAll} /></TableHead>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.map(r => (
                <TableRow key={r.id} className={selected.has(r.id) ? "bg-primary/5" : ""}>
                  <TableCell>
                    {!r.isAuto ? <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} /> : <span className="w-4" />}
                  </TableCell>
                  <TableCell className="text-xs font-medium">{r.title}{r.isAuto && <Badge variant="outline" className="ml-2 text-[9px] py-0">Auto</Badge>}</TableCell>
                  <TableCell className="text-xs text-muted-foreground capitalize">{r.reminder_type.replace(/_/g, " ")}</TableCell>
                  <TableCell className="text-xs">{r.due_date ? fmtDate(r.due_date) : "—"}</TableCell>
                  <TableCell><Badge variant="secondary" className={`text-[10px] capitalize ${priorityColors[r.priority] || ""}`}>{r.priority}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[r.status] || ""}`}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {!r.isAuto && r.status !== "completed" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Mark Complete" onClick={() => markComplete(r.id)}><Check className="h-3.5 w-3.5 text-positive" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Snooze" onClick={() => snoozeReminder(r.id)}><AlarmClockOff className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                      {!r.isAuto && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-negative" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Reminder" : "Add Reminder"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={form.reminder_type} onValueChange={v => setForm(f => ({ ...f, reminder_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REMINDER_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Due Date *</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Note</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>{t("action.cancel")}</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.due_date || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? t("common.saving") : t("action.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Reminder?" description="This action cannot be undone." onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }} />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={t("bulk.deleteTitle")}
        description={t("bulk.deleteDesc").replace("{count}", String(selected.size))}
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
        confirmLabel={t("bulk.confirmDelete").replace("{count}", String(selected.size))}
      />
    </div>
  );
}