import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

const PLANS = [
  { value: "free", label: "Free", desc: "Basic features" },
  { value: "monthly", label: "Monthly Premium", desc: "৳499/mo" },
  { value: "yearly", label: "Yearly Premium", desc: "৳3,999/yr" },
  { value: "lifetime", label: "Lifetime Premium", desc: "৳9,999 one-time" },
];

interface UpdatePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentPlan: string;
  onConfirm: (newPlan: string, note: string) => Promise<void>;
}

export function UpdatePlanModal({ open, onOpenChange, userName, currentPlan, onConfirm }: UpdatePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (selectedPlan === currentPlan) return;
    setSaving(true);
    await onConfirm(selectedPlan, note);
    setSaving(false);
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!saving) { onOpenChange(o); setSelectedPlan(currentPlan); setNote(""); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Crown className="h-4 w-4 text-feature-subscription" /> Update Subscription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs text-muted-foreground">User</p>
            <p className="text-sm font-medium">{userName}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
            <Badge variant={currentPlan !== "free" ? "default" : "outline"} className="text-[10px]">{currentPlan}</Badge>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">New Plan</Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLANS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{p.label}</span>
                      <span className="text-[10px] text-muted-foreground">{p.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Note / Reason (optional)</Label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Upgraded as promotional offer"
              className="text-sm min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); setSelectedPlan(currentPlan); setNote(""); }} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={saving || selectedPlan === currentPlan}>
            {saving ? "Saving..." : "Confirm Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
