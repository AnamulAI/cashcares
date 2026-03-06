import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockAccounts, mockCategories } from "@/data/mock-data";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";

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
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="font-display text-lg">Add Record</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a new financial record quickly and accurately
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="px-6">
            <TabsList className="w-full h-10 bg-muted/60 p-1 rounded-lg">
              <TabsTrigger value="income" className="flex-1 gap-1.5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md">
                <ArrowDownLeft className="h-3.5 w-3.5" /> Income
              </TabsTrigger>
              <TabsTrigger value="expense" className="flex-1 gap-1.5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md">
                <ArrowUpRight className="h-3.5 w-3.5" /> Expense
              </TabsTrigger>
              <TabsTrigger value="transfer" className="flex-1 gap-1.5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md">
                <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="income" className="px-6 pb-6 pt-5 space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                <Select><SelectTrigger className="h-10"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{incomeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Account</Label>
                <Select><SelectTrigger className="h-10"><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
                <Input type="number" placeholder="0.00" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Note</Label>
              <Textarea placeholder="Add a note..." rows={2} className="resize-none" />
            </div>
            <Button className="w-full h-10 shadow-sm font-medium">Add Income</Button>
          </TabsContent>

          <TabsContent value="expense" className="px-6 pb-6 pt-5 space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                <Select><SelectTrigger className="h-10"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{expenseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Account</Label>
                <Select><SelectTrigger className="h-10"><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
                <Input type="number" placeholder="0.00" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Note</Label>
              <Textarea placeholder="Add a note..." rows={2} className="resize-none" />
            </div>
            <Button className="w-full h-10 shadow-sm font-medium">Add Expense</Button>
          </TabsContent>

          <TabsContent value="transfer" className="px-6 pb-6 pt-5 space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">From Account</Label>
                <Select><SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">To Account</Label>
                <Select><SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
                <Input type="number" placeholder="0.00" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Transfer Fee</Label>
              <Input type="number" placeholder="0.00" className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Note</Label>
              <Textarea placeholder="Add a note..." rows={2} className="resize-none" />
            </div>
            <Button className="w-full h-10 shadow-sm font-medium">Transfer Money</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}