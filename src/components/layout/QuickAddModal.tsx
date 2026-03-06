import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockAccounts, mockCategories } from "@/data/mock-data";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

export function QuickAddModal({ open, onOpenChange, defaultTab = "income" }: QuickAddModalProps) {
  const incomeCategories = mockCategories.filter(c => c.group === "income");
  const expenseCategories = mockCategories.filter(c => c.group === "expense");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Add Record</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
            <TabsTrigger value="expense" className="flex-1">Expense</TabsTrigger>
            <TabsTrigger value="transfer" className="flex-1">Transfer</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{incomeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></div>
            </div>
            <div className="space-y-2"><Label>Note</Label><Textarea placeholder="Add a note..." rows={2} /></div>
            <Button className="w-full">Add Income</Button>
          </TabsContent>

          <TabsContent value="expense" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{expenseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></div>
            </div>
            <div className="space-y-2"><Label>Note</Label><Textarea placeholder="Add a note..." rows={2} /></div>
            <Button className="w-full">Add Expense</Button>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-4 mt-4">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
