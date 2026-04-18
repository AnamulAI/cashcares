import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateSavingsPlan, type SavingsPlan } from "@/hooks/use-savings";
import { formatAppDate } from "@/lib/formatters";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: SavingsPlan | null;
}

export function EditSavingsPlanModal({ open, onOpenChange, plan }: Props) {
  const update = useUpdateSavingsPlan();
  const [form, setForm] = useState({
    plan_name: "",
    recipient_name: "",
    installment_amount: 0,
    frequency: "monthly" as "weekly" | "monthly" | "quarterly",
    note: "",
  });

  useEffect(() => {
    if (plan && open) {
      setForm({
        plan_name: plan.plan_name || "",
        recipient_name: plan.recipient_name || "",
        installment_amount: Number(plan.installment_amount) || 0,
        frequency: plan.frequency,
        note: plan.note || "",
      });
    }
  }, [plan, open]);

  if (!plan) return null;

  async function handleSave() {
    if (!form.plan_name) return;
    await update.mutateAsync({
      id: plan!.id,
      plan_name: form.plan_name,
      recipient_name: form.recipient_name || null,
      installment_amount: Number(form.installment_amount),
      frequency: form.frequency,
      note: form.note || null,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Savings Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Plan Name *</Label>
            <Input value={form.plan_name} onChange={e => setForm({ ...form, plan_name: e.target.value })} />
          </div>
          <div>
            <Label>Recipient / Institution</Label>
            <Input value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Installment Amount *</Label>
              <Input
                type="number"
                value={form.installment_amount || ""}
                onChange={e => setForm({ ...form, installment_amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(v: any) => setForm({ ...form, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={2} />
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Locked fields
            </p>
            <p className="text-[11px] text-muted-foreground">
              Cannot be changed after creation to preserve schedule integrity.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <span className="text-muted-foreground">Plan Type:</span>{" "}
                <span className="font-medium capitalize">{plan.plan_type === "fixed" ? "Fixed-term" : "Open-ended"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Start Date:</span>{" "}
                <span className="font-medium">{formatAppDate(plan.start_date)}</span>
              </div>
              {plan.plan_type === "fixed" && (
                <>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>{" "}
                    <span className="font-medium">{plan.duration_months} periods</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target:</span>{" "}
                    <span className="font-medium">{Number(plan.target_amount).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={update.isPending || !form.plan_name}>
            {update.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
