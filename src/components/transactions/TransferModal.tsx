import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockAccounts } from "@/data/mock-data";

interface TransferModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function TransferModal({ open, onOpenChange }: TransferModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display">Transfer Money</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Account</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Account</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></div>
          </div>
          <div className="space-y-2"><Label>Transfer Fee</Label><Input type="number" placeholder="0.00" /></div>
          <div className="space-y-2"><Label>Note</Label><Textarea placeholder="Add a note..." rows={2} /></div>
          <Button className="w-full">Transfer Money</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
