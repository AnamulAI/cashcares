import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface AddAccountModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function AddAccountModal({ open, onOpenChange }: AddAccountModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display">Add Account</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Account Name</Label><Input placeholder="e.g. My Bank" /></div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Opening Balance</Label><Input type="number" placeholder="0.00" /></div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select defaultValue="BDT"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {["#6366f1","#10b981","#f59e0b","#e11d48","#8b5cf6","#f97316","#06b6d4","#78716c"].map(c => (
                <button key={c} className="h-7 w-7 rounded-full border-2 border-transparent hover:border-foreground/30 transition-colors" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Optional notes..." rows={2} /></div>
          <div className="flex items-center justify-between">
            <Label>Set as Primary</Label><Switch />
          </div>
          <div className="flex items-center justify-between">
            <Label>Active</Label><Switch defaultChecked />
          </div>
          <Button className="w-full">Create Account</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
