import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Wallet2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateAccount, useUpdateAccount, type DbAccount } from "@/hooks/use-accounts";

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAccount?: DbAccount | null;
}

const colors = ["#6366f1","#10b981","#f59e0b","#e11d48","#8b5cf6","#f97316","#06b6d4","#78716c"];

export function AddAccountModal({ open, onOpenChange, editAccount }: AddAccountModalProps) {
  const isEdit = !!editAccount;
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const [name, setName] = useState("");
  const [type, setType] = useState("cash");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [color, setColor] = useState("#6366f1");
  const [notes, setNotes] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setType(editAccount.type);
      setBalance(String(editAccount.balance));
      setCurrency(editAccount.currency);
      setColor(editAccount.color);
      setNotes(editAccount.notes || "");
      setIsPrimary(editAccount.is_primary);
      setIsActive(editAccount.is_active);
    } else {
      setName(""); setType("cash"); setBalance(""); setCurrency("BDT");
      setColor("#6366f1"); setNotes(""); setIsPrimary(false); setIsActive(true);
    }
  }, [editAccount, open]);

  const isPending = createAccount.isPending || updateAccount.isPending;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      type,
      balance: Number(balance) || 0,
      currency,
      color,
      icon: "Wallet",
      is_primary: isPrimary,
      is_active: isActive,
      notes: notes || null,
    };

    if (isEdit && editAccount) {
      await updateAccount.mutateAsync({ id: editAccount.id, ...payload });
    } else {
      await createAccount.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-base">{isEdit ? "Edit Account" : "Add Account"}</DialogTitle>
              <DialogDescription className="text-xs">{isEdit ? "Update account details" : "Create a new financial account"}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Account Name">
              <Input placeholder="e.g. My Bank" className="h-9" value={name} onChange={e => setName(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Account Type">
              <Select value={type} onValueChange={setType}><SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label={isEdit ? "Current Balance" : "Opening Balance"}>
              <Input type="number" placeholder="0.00" className="h-9" value={balance} onChange={e => setBalance(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Currency">
              <Select value={currency} onValueChange={setCurrency}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup label="Color">
            <div className="flex gap-2">
              {colors.map(c => (
                <button key={c} onClick={() => setColor(c)} className={cn("h-7 w-7 rounded-full border-2 transition-all relative flex items-center justify-center", color === c ? "border-foreground/40 scale-110" : "border-transparent hover:scale-110")} style={{ backgroundColor: c }}>
                  {color === c && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Notes">
            <Textarea placeholder="Optional notes..." rows={2} className="resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
          </FieldGroup>

          <Separator />

          <div className="flex items-center justify-between">
            <div><Label className="text-sm">Set as Primary</Label><p className="text-[11px] text-muted-foreground">Use as default account</p></div>
            <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label className="text-sm">Active</Label><p className="text-[11px] text-muted-foreground">Show in account lists</p></div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <Button className="w-full h-10 font-medium" onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "Saving..." : isEdit ? "Update Account" : "Create Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-medium">{label}</Label>
      {children}
    </div>
  );
}
