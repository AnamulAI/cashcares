import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Wallet2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateAccount, useUpdateAccount, type DbAccount } from "@/hooks/use-accounts";
import { getAccountVisual, detectBrand, getTypeDefaultColor, ACCOUNT_COLORS } from "./account-brands";

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAccount?: DbAccount | null;
}

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
  const [customHex, setCustomHex] = useState("");

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
      setCustomHex("");
    } else {
      setName(""); setType("cash"); setBalance(""); setCurrency("BDT");
      setColor("#6366f1"); setNotes(""); setIsPrimary(false); setIsActive(true);
      setCustomHex("");
    }
  }, [editAccount, open]);

  // Auto-detect brand and suggest color
  const detectedBrand = useMemo(() => detectBrand(name), [name]);

  useEffect(() => {
    if (!isEdit && detectedBrand && color === "#6366f1") {
      setColor(detectedBrand.color);
    }
  }, [detectedBrand, isEdit]);

  // When type changes (new account), suggest type default color
  useEffect(() => {
    if (!isEdit && !detectedBrand) {
      setColor(getTypeDefaultColor(type));
    }
  }, [type, isEdit, detectedBrand]);

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

  const handleCustomHex = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      setColor(hex);
    }
  };

  // Preview visual
  const previewVisual = getAccountVisual({ name, type, color });
  const PreviewIcon = previewVisual.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
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
          {/* Live Card Preview */}
          <div className="rounded-xl border border-border/60 overflow-hidden bg-accent/30">
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
            <div className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center ring-1 ring-border/30 shadow-sm" style={{ backgroundColor: `${color}14` }}>
                <PreviewIcon className="h-5 w-5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{name || "Account Name"}</p>
                <p className="text-xs text-muted-foreground capitalize">{type.replace("_", " ")}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-display tabular-nums">{balance || "0.00"}</p>
                <p className="text-[10px] text-muted-foreground">{currency}</p>
              </div>
            </div>
          </div>

          {detectedBrand && (
            <div className="flex items-center gap-2 px-1">
              <Badge variant="secondary" className="text-[11px] gap-1 py-0.5" style={{ backgroundColor: `${detectedBrand.color}14`, color: detectedBrand.color }}>
                <previewVisual.icon className="h-3 w-3" /> {detectedBrand.label} detected
              </Badge>
            </div>
          )}

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

          <FieldGroup label="Account Color">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {ACCOUNT_COLORS.map(c => (
                  <button key={c} onClick={() => { setColor(c); setCustomHex(""); }} className={cn("h-7 w-7 rounded-full border-2 transition-all relative flex items-center justify-center", color === c ? "border-foreground/40 scale-110" : "border-transparent hover:scale-110")} style={{ backgroundColor: c }}>
                    {color === c && <Check className="h-3.5 w-3.5 text-white drop-shadow-sm" />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full border border-border shrink-0" style={{ backgroundColor: color }} />
                <Input
                  placeholder="#hex"
                  className="h-8 w-28 text-xs font-mono"
                  value={customHex || color}
                  onChange={e => handleCustomHex(e.target.value)}
                />
              </div>
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
