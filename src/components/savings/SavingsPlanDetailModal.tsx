import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trash2, Pause, Play, CheckCircle2, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MarkInstallmentPaidModal } from "./MarkInstallmentPaidModal";
import {
  useSavingsInstallments, useDeleteSavingsPlan, useUpdateSavingsPlan, useGenerateMoreInstallments,
  type SavingsPlan, type SavingsInstallment
} from "@/hooks/use-savings";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { useAppContext } from "@/contexts/AppContext";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: SavingsPlan | null;
}

export function SavingsPlanDetailModal({ open, onOpenChange, plan }: Props) {
  const { currency } = useAppContext();
  const { data: installments = [] } = useSavingsInstallments(plan?.id);
  const del = useDeleteSavingsPlan();
  const upd = useUpdateSavingsPlan();
  const generate = useGenerateMoreInstallments();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paidModal, setPaidModal] = useState<SavingsInstallment | null>(null);

  if (!plan) return null;

  const paid = installments.filter(i => i.status === "paid");
  const pct = plan.target_amount > 0
    ? Math.min(100, Math.round((Number(plan.total_saved) / Number(plan.target_amount)) * 100))
    : 0;
  const remaining = Math.max(0, Number(plan.target_amount) - Number(plan.total_saved));
  const nextDue = installments.find(i => i.status !== "paid")?.due_date;

  async function handleDelete() {
    await del.mutateAsync(plan!.id);
    setConfirmOpen(false);
    onOpenChange(false);
  }

  async function togglePause() {
    await upd.mutateAsync({
      id: plan!.id,
      status: plan!.status === "paused" ? "active" : "paused",
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {plan.plan_name}
              <Badge variant="outline" className="capitalize">{plan.status}</Badge>
            </DialogTitle>
            {plan.recipient_name && (
              <p className="text-sm text-muted-foreground">{plan.recipient_name}</p>
            )}
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total Saved</p>
                  <p className="text-lg font-bold font-display">{formatAmount(Number(plan.total_saved), currency)}</p>
                </div>
                {plan.plan_type === "fixed" ? (
                  <>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-lg font-bold font-display">{formatAmount(Number(plan.target_amount), currency)}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="text-lg font-bold font-display">{formatAmount(remaining, currency)}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Maturity</p>
                      <p className="text-lg font-bold font-display">{plan.maturity_date ? formatAppDate(plan.maturity_date) : "—"}</p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-lg font-bold font-display">Open-ended</p>
                  </div>
                )}
              </div>

              {plan.plan_type === "fixed" && (
                <div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{pct}% complete · {paid.length} of {installments.length} installments</p>
                </div>
              )}

              <div className="rounded-lg border p-3 text-sm">
                <p><span className="text-muted-foreground">Installment:</span> {formatAmount(Number(plan.installment_amount), currency)} / {plan.frequency}</p>
                <p><span className="text-muted-foreground">Started:</span> {formatAppDate(plan.start_date)}</p>
                {nextDue && <p><span className="text-muted-foreground">Next due:</span> {formatAppDate(nextDue)}</p>}
                {plan.note && <p className="mt-2 text-muted-foreground">{plan.note}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={togglePause}>
                  {plan.status === "paused" ? <><Play className="h-4 w-4 mr-1" /> Resume</> : <><Pause className="h-4 w-4 mr-1" /> Pause</>}
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="pt-3">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {installments.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No installments scheduled</p>}
                {installments.map((ins, idx) => (
                  <div key={ins.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-6">#{idx + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{formatAppDate(ins.due_date)}</p>
                        <p className="text-xs text-muted-foreground">{formatAmount(Number(ins.amount), currency)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        ins.status === "paid" ? "default" :
                        ins.status === "overdue" ? "destructive" : "outline"
                      } className="capitalize">{ins.status}</Badge>
                      {ins.status !== "paid" && (
                        <Button size="sm" variant="outline" onClick={() => setPaidModal(ins)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {plan.plan_type === "open" && plan.status === "active" && (
                <div className="pt-3 mt-3 border-t flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Open-ended plan — extend the schedule when needed.</p>
                  <Button size="sm" variant="outline" onClick={() => generate.mutate({ plan, count: 12 })} disabled={generate.isPending}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> {generate.isPending ? "Generating…" : "Generate next 12"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="pt-3">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {paid.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No deposits recorded yet</p>}
                {paid.sort((a,b) => (b.paid_date || "").localeCompare(a.paid_date || "")).map(ins => (
                  <div key={ins.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{ins.paid_date && formatAppDate(ins.paid_date)}</p>
                      {ins.note && <p className="text-xs text-muted-foreground">{ins.note}</p>}
                    </div>
                    <p className="text-sm font-semibold text-positive">+{formatAmount(Number(ins.paid_amount), currency)}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this savings plan?"
        description="This will permanently delete the plan and all its installments. Account balances are not refunded."
        onConfirm={handleDelete}
        loading={del.isPending}
      />

      <MarkInstallmentPaidModal
        open={!!paidModal}
        onOpenChange={(v) => !v && setPaidModal(null)}
        installment={paidModal}
      />
    </>
  );
}
