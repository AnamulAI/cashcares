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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wallet2, Check, Star, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateAccount, useUpdateAccount, type DbAccount } from "@/hooks/use-accounts";
import { getAccountVisual, detectBrand, getTypeDefaultColor, getTypeIcon, getIconByName, ACCOUNT_COLORS, ACCOUNT_ICON_OPTIONS } from "./account-brands";

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAccount?: DbAccount | null;
}

const TYPE_OPTIONS = [
  { value: "cash", label: "Cash", labelBn: "নগদ" },
  { value: "bank", label: "Bank", labelBn: "ব্যাংক" },
  { value: "mobile_wallet", label: "Mobile Wallet", labelBn: "মোবাইল ওয়ালেট" },
  { value: "card", label: "Card", labelBn: "কার্ড" },
  { value: "savings", label: "Savings", labelBn: "সঞ্চয়" },
  { value: "business", label: "Business", labelBn: "ব্যবসা" },
  { value: "shared", label: "Shared", labelBn: "যৌথ" },
];

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
  const [iconOverride, setIconOverride] = useState<string | null>(null);

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
      setIconOverride(editAccount.icon || null);
    } else {
      setName(""); setType("cash"); setBalance(""); setCurrency("BDT");
      setColor("#6366f1"); setNotes(""); setIsPrimary(false); setIsActive(true);
      setCustomHex(""); setIconOverride(null);
    }
  }, [editAccount, open]);

  // Auto-detect brand and suggest color
  const detectedBrand = useMemo(() => detectBrand(name), [name]);

  useEffect(() => {
    if (!isEdit && detectedBrand && color === "#6366f1") {
      setColor(detectedBrand.color);
    }
  }, [detectedBrand, isEdit]);

  // Auto-suggest type from brand detection
  useEffect(() => {
    if (!isEdit && detectedBrand) {
      // If brand is a mobile wallet type
      const walletBrands = ["bkash", "nagad", "rocket", "upay", "tap"];
      const lower = name.toLowerCase();
      if (walletBrands.some(w => lower.includes(w))) {
        setType("mobile_wallet");
      } else if (detectedBrand.label) {
        setType("bank");
      }
    }
  }, [detectedBrand, name, isEdit]);

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
      icon: iconOverride || "Wallet",
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

  // Preview visual — pass icon override
  const previewVisual = getAccountVisual({ name, type, color, icon: iconOverride });
  const PreviewIcon = previewVisual.icon;

  // Resolved icon for icon picker display
  const currentIconOption = ACCOUNT_ICON_OPTIONS.find(o => o.name === iconOverride);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
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
          {/* Enhanced Live Card Preview */}
          <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }} />
            <div className="p-4">
              <div className="flex items-start gap-3.5">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center ring-1 ring-border/20 shadow-sm shrink-0 transition-all duration-200"
                  style={{ backgroundColor: `${color}18`, boxShadow: `0 4px 12px -4px ${color}30` }}
                >
                  <PreviewIcon className="h-6 w-6 transition-colors duration-200" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{name || "Account Name"}</p>
                    {isPrimary && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-muted-foreground capitalize">{type.replace("_", " ")}</span>
                    <span className="text-muted-foreground/40 text-[11px]">·</span>
                    <span className="text-[11px] text-muted-foreground">{currency}</span>
                    {!isActive && (
                      <>
                        <span className="text-muted-foreground/40 text-[11px]">·</span>
                        <span className="text-[11px] text-muted-foreground/60">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold font-display tabular-nums leading-tight">
                    {currency === "BDT" ? "৳" : currency === "USD" ? "$" : "€"}{balance || "0.00"}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-[9px] px-1.5 py-0 mt-1 border-0"
                    style={{ backgroundColor: `${color}12`, color }}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {detectedBrand && (
            <div className="flex items-center gap-2 px-1">
              <Badge variant="secondary" className="text-[11px] gap-1 py-0.5" style={{ backgroundColor: `${detectedBrand.color}14`, color: detectedBrand.color }}>
                <previewVisual.icon className="h-3 w-3" /> {detectedBrand.label} detected
              </Badge>
              <span className="text-[11px] text-muted-foreground">Color & type auto-set</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Account Name">
              <Input placeholder="e.g. bKash, DBBL" className="h-9" value={name} onChange={e => setName(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Account Type">
              <Select value={type} onValueChange={setType}><SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
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

          {/* Icon Override Picker */}
          <FieldGroup label="Account Icon">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 w-full justify-between text-xs font-normal">
                  <span className="flex items-center gap-2">
                    {currentIconOption ? (
                      <>
                        <currentIconOption.icon className="h-4 w-4" style={{ color }} />
                        {currentIconOption.name}
                      </>
                    ) : (
                      <>
                        <PreviewIcon className="h-4 w-4" style={{ color }} />
                        Auto ({detectedBrand ? detectedBrand.label : type.replace("_", " ")})
                      </>
                    )}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <p className="text-xs font-medium text-muted-foreground mb-2">Choose an icon</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {/* Auto option */}
                  <button
                    onClick={() => setIconOverride(null)}
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center border transition-all",
                      !iconOverride ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border/50 hover:bg-accent"
                    )}
                    title="Auto-detect"
                  >
                    {(() => {
                      const AutoIcon = detectedBrand?.icon || getTypeIcon(type);
                      return <AutoIcon className="h-4 w-4 text-muted-foreground" />;
                    })()}
                  </button>
                  {ACCOUNT_ICON_OPTIONS.map(opt => (
                    <button
                      key={opt.name}
                      onClick={() => setIconOverride(opt.name)}
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center border transition-all",
                        iconOverride === opt.name ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border/50 hover:bg-accent"
                      )}
                      title={opt.name}
                    >
                      <opt.icon className="h-4 w-4" style={{ color: iconOverride === opt.name ? color : undefined }} />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </FieldGroup>

          <FieldGroup label="Account Color">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {ACCOUNT_COLORS.map(c => (
                  <button key={c} onClick={() => { setColor(c); setCustomHex(""); }} className={cn("h-6.5 w-6.5 rounded-full border-2 transition-all relative flex items-center justify-center", color === c ? "border-foreground/40 scale-110" : "border-transparent hover:scale-110")} style={{ backgroundColor: c, width: 26, height: 26 }}>
                    {color === c && <Check className="h-3 w-3 text-white drop-shadow-sm" />}
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
