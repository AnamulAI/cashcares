import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowDownLeft, Paperclip } from "lucide-react";
import { mockAccounts, mockCategories } from "@/data/mock-data";

interface AddIncomeModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function AddIncomeModal({ open, onOpenChange }: AddIncomeModalProps) {
  const categories = mockCategories.filter(c => c.group === "income");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-positive/10 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4 text-positive" />
            </div>
            <div>
              <DialogTitle className="font-display text-base">Add Income</DialogTitle>
              <DialogDescription className="text-xs">Record a new income transaction</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Category">
              <Select><SelectTrigger className="h-9"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Account">
              <Select><SelectTrigger className="h-9"><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Amount">
              <Input type="number" placeholder="0.00" className="h-9" />
            </FieldGroup>
            <FieldGroup label="Date">
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-9" />
            </FieldGroup>
          </div>
          <FieldGroup label="Note">
            <Textarea placeholder="Add a note..." rows={2} className="resize-none" />
          </FieldGroup>
          <FieldGroup label="Tags">
            <Input placeholder="e.g. march, bonus" className="h-9" />
          </FieldGroup>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Recurring</Label>
              <p className="text-[11px] text-muted-foreground">Repeat this income automatically</p>
            </div>
            <Switch />
          </div>
          <div>
            <Label className="text-sm mb-2 block">Attachment</Label>
            <div className="rounded-lg border-2 border-dashed border-border/60 p-4 text-center hover:border-primary/30 hover:bg-accent/30 transition-colors cursor-pointer">
              <Paperclip className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Drop file here or click to upload</p>
            </div>
          </div>
          <Button className="w-full h-10 font-medium">Add Income</Button>
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
