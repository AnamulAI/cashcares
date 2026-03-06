import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface AddCategoryModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function AddCategoryModal({ open, onOpenChange }: AddCategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display">Add Category</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Category Name</Label><Input placeholder="e.g. Groceries" /></div>
            <div className="space-y-2">
              <Label>Group / Type</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="receivable">Receivable</SelectItem>
                  <SelectItem value="payable">Payable</SelectItem>
                  <SelectItem value="debt">Debt</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Parent Category (optional)</Label>
            <Select><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent><SelectItem value="none">None</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {["🏠","💰","🍕","🚗","📚","🎮","💊","🛍️","⚡","✈️","🎁","📊"].map(icon => (
                <button key={icon} className="h-9 w-9 rounded-lg border text-lg hover:bg-accent transition-colors flex items-center justify-center">{icon}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {["#6366f1","#10b981","#f59e0b","#e11d48","#8b5cf6","#f97316","#06b6d4","#ec4899","#78716c","#3b82f6"].map(c => (
                <button key={c} className="h-7 w-7 rounded-full border-2 border-transparent hover:border-foreground/30 transition-colors" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Optional description..." rows={2} /></div>
          <div className="flex items-center justify-between"><Label>Active</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Usable in Budgets</Label><Switch /></div>
          <Button className="w-full">Create Category</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
