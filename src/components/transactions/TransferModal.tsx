import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { mockAccounts } from "@/data/mock-data";

interface TransferModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function TransferModal({ open, onOpenChange }: TransferModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowLeftRight className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-base">Transfer Money</DialogTitle>
              <DialogDescription className="text-xs">Move funds between your accounts</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <FieldGroup label="From Account">
              <Select><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <div className="h-9 flex items-center">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <FieldGroup label="To Account">
              <Select><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Amount">
              <Input type="number" placeholder="0.00" className="h-9" />
            </FieldGroup>
            <FieldGroup label="Date">
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-9" />
            </FieldGroup>
          </div>
          <FieldGroup label="Transfer Fee">
            <Input type="number" placeholder="0.00" className="h-9" />
          </FieldGroup>
          <FieldGroup label="Note">
            <Textarea placeholder="Add a note..." rows={2} className="resize-none" />
          </FieldGroup>

          <Button className="w-full h-10 font-medium">Transfer Money</Button>
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
