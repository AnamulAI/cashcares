import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Trash2, Pause, Play, CheckCircle2, Plus, MoreHorizontal, Pencil,
  RotateCcw, Calendar, Wallet, PiggyBank, TrendingUp, Clock, Target,
  Printer, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { PrintStatementHeader, PrintStatementFooter } from "@/components/shared/PrintStatementHeader";
import { MarkInstallmentPaidModal } from "@/components/savings/MarkInstallmentPaidModal";
import { EditSavingsPlanModal } from "@/components/savings/EditSavingsPlanModal";
import { EditInstallmentModal } from "@/components/savings/EditInstallmentModal";
import {
  useSavingsPlans, useSavingsInstallments, useDeleteSavingsPlan, useUpdateSavingsPlan, useGenerateMoreInstallments,
  type SavingsInstallment
} from "@/hooks/use-savings";
import { useAccounts } from "@/hooks/use-accounts";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { APP_CONFIG } from "@/config/app";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  paused: "bg-warning/10 text-warning",
  completed: "bg-positive/10 text-positive",
};

const installmentStatusBadge: Record<string, string> = {
  paid: "bg-positive/10 text-positive",
  pending: "bg-muted text-muted-foreground",
  overdue: "bg-negative/10 text-negative",
};

export default function SavingsLedger() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useAppContext();
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const { data: plans = [], isLoading: plansLoading } = useSavingsPlans();
  const plan = useMemo(() => plans.find(p => p.id === id) || null, [plans, id]);
  const { data: installments = [] } = useSavingsInstallments(plan?.id);
  const { data: accounts = [] } = useAccounts();
  const del = useDeleteSavingsPlan();
  const upd = useUpdateSavingsPlan();
  const generate = useGenerateMoreInstallments();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paidModal, setPaidModal] = useState<SavingsInstallment | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteInstId, setDeleteInstId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editInst, setEditInst] = useState<SavingsInstallment | null>(null);

  const recentPaid = useMemo(() =>
    installments
      .filter(i => i.status === "paid")
      .sort((a, b) => (b.paid_date || "").localeCompare(a.paid_date || ""))
      .slice(0, 4),
    [installments]
  );

  const filtered = useMemo(() =>
    installments.filter(i => statusFilter === "all" || i.status === statusFilter),
    [installments, statusFilter]
  );

  if (plansLoading) {
    return <div className="space-y-4 p-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-20" /></div>;
  }

  if (!plan) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Savings plan not found.</p>
        <Button variant="link" onClick={() => navigate("/savings")}>← Back to Savings</Button>
      </div>
    );
  }

  const target = Number(plan.target_amount);
  const saved = Number(plan.total_saved);
  const remaining = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  const paidCount = installments.filter(i => i.status === "paid").length;
  const pendingCount = installments.filter(i => i.status === "pending").length;
  const overdueCount = installments.filter(i => i.status === "overdue").length;
  const nextDue = installments.find(i => i.status !== "paid")?.due_date;

  const fmt = (n: number) => formatAmount(n, currency);
  const accountName = (aid: string | null) =>
    aid ? (accounts.find(a => a.id === aid)?.name || "—") : "—";

  async function handleDelete() {
    await del.mutateAsync(plan!.id);
    setConfirmOpen(false);
    navigate("/savings");
  }

  async function togglePause() {
    await upd.mutateAsync({
      id: plan!.id,
      status: plan!.status === "paused" ? "active" : "paused",
    });
  }

  async function handleReverseInstallment(ins: SavingsInstallment) {
    try {
      if (ins.linked_account_id && Number(ins.paid_amount) > 0) {
        const { data: acct } = await (supabase as any)
          .from("accounts").select("balance").eq("id", ins.linked_account_id).single();
        if (acct) {
          const newBal = Number(acct.balance) + Number(ins.paid_amount);
          await (supabase as any).from("accounts").update({ balance: newBal }).eq("id", ins.linked_account_id);
        }
      }
      const { data: p } = await (supabase as any)
        .from("savings_plans").select("total_saved, status, plan_type").eq("id", ins.plan_id).single();
      if (p) {
        const newTotal = Math.max(0, Number(p.total_saved) - Number(ins.paid_amount));
        const updates: any = { total_saved: newTotal };
        if (p.status === "completed") updates.status = "active";
        await (supabase as any).from("savings_plans").update(updates).eq("id", ins.plan_id);
      }
      await (supabase as any).from("savings_installments").update({
        status: "pending",
        paid_date: null,
        paid_amount: 0,
        linked_account_id: null,
      }).eq("id", ins.id);

      qc.invalidateQueries({ queryKey: ["savings_plans"] });
      qc.invalidateQueries({ queryKey: ["savings_installments", ins.plan_id] });
      qc.invalidateQueries({ queryKey: ["savings_installments_all"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Installment reversed");
    } catch (e: any) {
      toast.error(e.message || "Failed to reverse");
    }
  }

  async function handleDeleteInstallment(insId: string) {
    try {
      await (supabase as any).from("savings_installments").delete().eq("id", insId);
      qc.invalidateQueries({ queryKey: ["savings_installments", plan!.id] });
      qc.invalidateQueries({ queryKey: ["savings_installments_all"] });
      toast.success("Installment deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setDeleteInstId(null);
    }
  }

  const handlePrint = () => window.print();

  const handleCSV = () => {
    const headerLine = `Plan: ${plan.plan_name} | Recipient: ${plan.recipient_name || "—"} | Frequency: ${plan.frequency} | Target: ${plan.plan_type === "fixed" ? target : "Open-ended"}`;
    const headers = ["#", "Due Date", "Amount", "Paid Date", "Paid Amount", "Account", "Status", "Note"];
    const rows = installments.map((ins, idx) => [
      idx + 1,
      ins.due_date,
      Number(ins.amount),
      ins.paid_date || "",
      Number(ins.paid_amount),
      accountName(ins.linked_account_id),
      ins.status,
      (ins.note || "").replace(/[\r\n,]/g, " "),
    ]);
    const csv = [headerLine, "", headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.plan_name.replace(/[^a-z0-9]/gi, "-")}-installments-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PrintStatementHeader
        documentTitle="Savings Plan Statement"
        subjectId={plan.id}
        subjectIdLabel="Plan ID"
        periodStart={plan.start_date}
        detailsTitle="Plan Details"
        scheduleTitle="Installment Schedule"
        details={[
          { label: "Plan Name", value: plan.plan_name },
          { label: "Type", value: plan.plan_type === "fixed" ? "Fixed-term" : "Open-ended" },
          { label: "Recipient", value: plan.recipient_name || "Self" },
          { label: "Frequency", value: plan.frequency },
          { label: "Status", value: plan.status },
          { label: "Started", value: formatAppDate(plan.start_date) },
          { label: "Installment", value: fmt(Number(plan.installment_amount)) },
          { label: "Maturity", value: plan.maturity_date ? formatAppDate(plan.maturity_date) : "—" },
          ...(plan.note ? [{ label: "Note", value: plan.note, fullWidth: true }] : []),
        ]}
        summary={[
          { label: "Target", value: plan.plan_type === "fixed" ? fmt(target) : "Open-ended" },
          { label: "Saved", value: fmt(saved) },
          { label: "Remaining", value: plan.plan_type === "fixed" ? fmt(remaining) : "—" },
          { label: "Progress", value: plan.plan_type === "fixed" ? `${pct}%` : "—" },
          { label: "Next Due", value: nextDue ? formatAppDate(nextDue) : "—" },
        ]}
        summaryCaption={
          <>
            <span className="font-semibold text-foreground">{paidCount}</span> Paid &nbsp;·&nbsp;
            <span className="font-semibold text-foreground">{pendingCount}</span> Pending &nbsp;·&nbsp;
            <span className="font-semibold text-foreground">{overdueCount}</span> Overdue &nbsp;·&nbsp;
            <span className="font-semibold text-foreground">{installments.length}</span> Total
          </>
        }
      />

      <div className="flex items-center gap-2 no-print">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/savings")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      <div className="no-print">
        <PageHeader
          title={plan.plan_name}
          subtitle={[
            plan.recipient_name,
            plan.frequency,
            plan.plan_type === "fixed" ? "Fixed-term" : "Open-ended",
            plan.note,
          ].filter(Boolean).join(" · ") || "Savings plan"}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-[10px] capitalize ${statusBadge[plan.status] || ""}`}>
                {plan.status}
              </Badge>
              {plan.plan_type === "open" && plan.status === "active" && (
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => generate.mutate({ plan, count: 12 })}
                  disabled={generate.isPending}
                >
                  <Plus className="h-4 w-4" /> {generate.isPending ? "Generating…" : "Add Installments"}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Plan
                  </DropdownMenuItem>
                  {plan.status !== "completed" && (
                    <DropdownMenuItem onClick={togglePause}>
                      {plan.status === "paused" ? <Play className="h-3.5 w-3.5 mr-2" /> : <Pause className="h-3.5 w-3.5 mr-2" />}
                      {plan.status === "paused" ? "Resume" : "Pause"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="h-3.5 w-3.5 mr-2" /> Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrint}>
                    <Download className="h-3.5 w-3.5 mr-2" /> PDF (Print)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCSV}>
                    <Download className="h-3.5 w-3.5 mr-2" /> Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => setConfirmOpen(true)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        <FinanceCard
          icon={<Target className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          label="Total Target"
          value={plan.plan_type === "fixed" ? fmt(target) : "Open-ended"}
        />
        <FinanceCard
          icon={<Wallet className="h-5 w-5 text-positive" />}
          iconBg="bg-positive/10"
          label="Total Saved"
          value={fmt(saved)}
        />
        <FinanceCard
          icon={<TrendingUp className="h-5 w-5 text-feature-savings" />}
          iconBg="bg-feature-savings/10"
          label="Remaining"
          value={plan.plan_type === "fixed" ? fmt(remaining) : "—"}
        />
        <FinanceCard
          icon={<CheckCircle2 className="h-5 w-5 text-positive" />}
          iconBg="bg-positive/10"
          label="Paid Installments"
          value={String(paidCount)}
        />
        <FinanceCard
          icon={<Clock className="h-5 w-5 text-warning" />}
          iconBg="bg-warning/10"
          label="Pending Installments"
          value={String(pendingCount + overdueCount)}
        />
        <FinanceCard
          icon={<Calendar className="h-5 w-5 text-feature-savings" />}
          iconBg="bg-feature-savings/10"
          label="Next Due Date"
          value={nextDue ? formatAppDate(nextDue) : "—"}
        />
      </div>

      {/* Schedule + Recent Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
        <Card className="finance-card-static p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-feature-savings/10">
              <PiggyBank className="h-4 w-4 text-feature-savings" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Schedule Overview</h4>
              <p className="text-[11px] text-muted-foreground">
                {fmt(Number(plan.installment_amount))} / {plan.frequency}
              </p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Installments</span><span>{installments.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-positive">{paidCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span>{pendingCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Overdue</span><span className="text-negative">{overdueCount}</span></div>
            {plan.plan_type === "fixed" && (
              <div className="pt-2">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            )}
            <div className="flex justify-between border-t pt-1.5 font-semibold">
              <span>Started</span>
              <span>{formatAppDate(plan.start_date)}</span>
            </div>
            {plan.maturity_date && (
              <div className="flex justify-between font-semibold">
                <span>Maturity</span>
                <span>{formatAppDate(plan.maturity_date)}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="finance-card-static p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-positive/10">
              <CheckCircle2 className="h-4 w-4 text-positive" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Recent Activity</h4>
              <p className="text-[11px] text-muted-foreground">Latest paid installments</p>
            </div>
          </div>
          {recentPaid.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No deposits recorded yet</p>
          ) : (
            <div className="space-y-2">
              {recentPaid.map(ins => (
                <div key={ins.id} className="flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{ins.paid_date && formatAppDate(ins.paid_date)}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{accountName(ins.linked_account_id)}</p>
                  </div>
                  <p className="font-semibold text-positive shrink-0">+{fmt(Number(ins.paid_amount))}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        {statusFilter !== "all" && (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => setStatusFilter("all")}>
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      {/* Installments Table */}
      {filtered.length === 0 ? (
        <Card className="finance-card-static p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {installments.length === 0 ? "No installments scheduled yet." : "No installments match the filter."}
          </p>
        </Card>
      ) : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs">#</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs text-right">Paid Amount</TableHead>
                <TableHead className="text-xs">Account</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right no-print">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ins) => {
                const idx = installments.findIndex(i => i.id === ins.id);
                return (
                  <TableRow key={ins.id}>
                    <TableCell className="text-xs">{formatAppDate(ins.due_date)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">#{idx + 1}</TableCell>
                    <TableCell className="text-xs text-right font-semibold">{fmt(Number(ins.amount))}</TableCell>
                    <TableCell className="text-xs text-right">
                      {ins.status === "paid" ? (
                        <span className="text-positive font-semibold">{fmt(Number(ins.paid_amount))}</span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{accountName(ins.linked_account_id)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] capitalize ${installmentStatusBadge[ins.status] || ""}`}>
                        {ins.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right no-print">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {ins.status !== "paid" ? (
                            <DropdownMenuItem onClick={() => setPaidModal(ins)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Mark Paid
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleReverseInstallment(ins)}>
                              <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reverse
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setEditInst(ins)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteInstId(ins.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {plan.plan_type === "open" && plan.status === "active" && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 no-print">
          <p className="text-xs text-muted-foreground">
            Open-ended plan — extend the schedule whenever needed.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => generate.mutate({ plan, count: 12 })}
            disabled={generate.isPending}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {generate.isPending ? "Generating…" : "Generate next 12 installments"}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this savings plan?"
        description="This will permanently delete the plan and all its installments. Account balances are not refunded."
        onConfirm={handleDelete}
        loading={del.isPending}
      />

      <ConfirmDialog
        open={!!deleteInstId}
        onOpenChange={() => setDeleteInstId(null)}
        title="Delete this installment?"
        description="This permanently removes the installment from the schedule."
        onConfirm={() => deleteInstId && handleDeleteInstallment(deleteInstId)}
      />

      <MarkInstallmentPaidModal
        open={!!paidModal}
        onOpenChange={(v) => !v && setPaidModal(null)}
        installment={paidModal}
      />

      <EditSavingsPlanModal
        open={editOpen}
        onOpenChange={setEditOpen}
        plan={plan}
      />

      <EditInstallmentModal
        open={!!editInst}
        onOpenChange={(v) => !v && setEditInst(null)}
        installment={editInst}
      />

      {/* Print-only footer */}
      <div className="print-only mt-6 pt-3 border-t text-center text-[10px] text-muted-foreground">
        Generated by {APP_CONFIG.name} · {APP_CONFIG.tagline} · {format(new Date(), "dd MMM, yyyy HH:mm")}
      </div>
    </div>
  );
}
