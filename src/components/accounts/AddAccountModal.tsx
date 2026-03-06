import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Wallet2 } from "lucide-react";

interface AddAccountModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function AddAccountModal({ open, onOpenChange }: AddAccountModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-base">Add Account</DialogTitle>
              <DialogDescription className="text-xs">Create a new financial account</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Account Name">
              <Input placeholder="e.g. My Bank" className="h-9" />
            </FieldGroup>
            <FieldGroup label="Account Type">
              <Select><SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
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
            <FieldGroup label="Opening Balance">
              <Input type="number" placeholder="0.00" className="h-9" />
            </FieldGroup>
            <FieldGroup label="Currency">
              <Select defaultValue="BDT"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
              {["#6366f1","#10b981","#f59e0b","#e11d48","#8b5cf6","#f97316","#06b6d4","#78716c"].map(c => (
                <button key={c} className="h-7 w-7 rounded-full border-2 border-transparent hover:border-foreground/30 hover:scale-110 transition-all" style={{ backgroundColor: c }} />
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Notes">
            <Textarea placeholder="Optional notes..." rows={2} className="resize-none" />
          </FieldGroup>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Set as Primary</Label>
              <p className="text-[11px] text-muted-foreground">Use as default account</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Active</Label>
              <p className="text-[11px] text-muted-foreground">Show in account lists</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button className="w-full h-10 font-medium">Create Account</Button>
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
