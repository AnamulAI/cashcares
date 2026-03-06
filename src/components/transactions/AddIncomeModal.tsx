import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { mockAccounts, mockCategories } from "@/data/mock-data";

interface AddIncomeModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function AddIncomeModal({ open, onOpenChange }: AddIncomeModalProps) {
  const categories = mockCategories.filter(c => c.group === "income");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display">Add Income</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></div>
          </div>
          <div className="space-y-2"><Label>Note</Label><Textarea placeholder="Add a note..." rows={2} /></div>
          <div className="space-y-2"><Label>Tags</Label><Input placeholder="e.g. march, bonus" /></div>
          <div className="flex items-center justify-between">
            <Label>Recurring</Label>
            <Switch />
          </div>
          <div className="space-y-2">
            <Label>Attachment</Label>
            <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
              Drop file here or click to upload
            </div>
          </div>
          <Button className="w-full">Add Income</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
