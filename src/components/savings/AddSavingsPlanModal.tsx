import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSavingsPlan } from "@/hooks/use-savings";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function AddSavingsPlanModal({ open, onOpenChange }: Props) {
  const create = useCreateSavingsPlan();
  const [planType, setPlanType] = useState<"fixed" | "open">("fixed");
  const [form, setForm] = useState({
    plan_name: "",
    recipient_name: "",
    installment_amount: 0,
    frequency: "monthly" as "monthly" | "weekly" | "quarterly",
    duration_months: 12,
    start_date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  async function handleSave() {
    if (!form.plan_name || form.installment_amount <= 0) return;
    await create.mutateAsync({
      plan_name: form.plan_name,
      recipient_name: form.recipient_name,
      plan_type: planType,
      installment_amount: Number(form.installment_amount),
      frequency: form.frequency,
      duration_months: planType === "fixed" ? Number(form.duration_months) : undefined,
      start_date: form.start_date,
      note: form.note,
    });
    onOpenChange(false);
    setForm({ plan_name: "", recipient_name: "", installment_amount: 0, frequency: "monthly", duration_months: 12, start_date: new Date().toISOString().slice(0, 10), note: "" });
  }

  const target = planType === "fixed" ? form.installment_amount * form.duration_months : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Savings Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Plan Name *</Label>
            <Input value={form.plan_name} onChange={e => setForm({ ...form, plan_name: e.target.value })} placeholder="e.g. DPS Savings, Foundation Donation" />
          </div>
          <div>
            <Label>Recipient / Institution</Label>
            <Input value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} placeholder="e.g. XYZ Foundation" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Installment Amount *</Label>
              <Input type="number" value={form.installment_amount || ""} onChange={e => setForm({ ...form, installment_amount: Number(e.target.value) })} />
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
            <Label>Plan Type</Label>
            <Select value={planType} onValueChange={(v: any) => setPlanType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed-term (with maturity)</SelectItem>
                <SelectItem value="open">Open-ended (no end date)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {planType === "fixed" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (periods)</Label>
                <Input type="number" value={form.duration_months} onChange={e => setForm({ ...form, duration_months: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Target Amount</Label>
                <Input value={target.toLocaleString()} disabled />
              </div>
            </div>
          )}
          <div>
            <Label>Start Date</Label>
            <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={create.isPending}>Create Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
