import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { toast } from "sonner";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

export function QuickAddModal({ open, onOpenChange, defaultTab = "income" }: QuickAddModalProps) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createTxn = useCreateTransaction();

  const incomeCategories = categories.filter(c => c.group === "income");
  const expenseCategories = categories.filter(c => c.group === "expense");
  const activeAccounts = accounts.filter(a => a.is_active);

  // Income state
  const [iCat, setICat] = useState("");
  const [iAcc, setIAcc] = useState("");
  const [iAmt, setIAmt] = useState("");
  const [iDate, setIDate] = useState(new Date().toISOString().split("T")[0]);
  const [iNote, setINote] = useState("");

  // Expense state
  const [eCat, setECat] = useState("");
  const [eAcc, setEAcc] = useState("");
  const [eAmt, setEAmt] = useState("");
  const [eDate, setEDate] = useState(new Date().toISOString().split("T")[0]);
  const [eNote, setENote] = useState("");

  // Transfer state
  const [tFrom, setTFrom] = useState("");
  const [tTo, setTTo] = useState("");
  const [tAmt, setTAmt] = useState("");
  const [tDate, setTDate] = useState(new Date().toISOString().split("T")[0]);
  const [tFee, setTFee] = useState("");
  const [tNote, setTNote] = useState("");

  const reset = () => {
    setICat(""); setIAcc(""); setIAmt(""); setINote("");
    setECat(""); setEAcc(""); setEAmt(""); setENote("");
    setTFrom(""); setTTo(""); setTAmt(""); setTFee(""); setTNote("");
  };

  const handleIncome = async () => {
    if (!iAcc || !iAmt) return;
    await createTxn.mutateAsync({ type: "income", category_id: iCat || null, account_id: iAcc, to_account_id: null, amount: Number(iAmt), date: iDate, note: iNote || null, tags: null, status: "completed", transfer_fee: 0 });
    reset(); onOpenChange(false);
  };

  const handleExpense = async () => {
    if (!eAcc || !eAmt) return;
    await createTxn.mutateAsync({ type: "expense", category_id: eCat || null, account_id: eAcc, to_account_id: null, amount: Number(eAmt), date: eDate, note: eNote || null, tags: null, status: "completed", transfer_fee: 0 });
    reset(); onOpenChange(false);
  };

  const handleTransfer = async () => {
    if (!tFrom || !tTo || !tAmt) return;
    if (tFrom === tTo) { toast.error("Cannot transfer to the same account"); return; }
    await createTxn.mutateAsync({ type: "transfer", category_id: null, account_id: tFrom, to_account_id: tTo, amount: Number(tAmt), date: tDate, note: tNote || null, tags: null, status: "completed", transfer_fee: Number(tFee) || 0 });
    reset(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="font-display text-lg">Add Record</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">Create a new financial record quickly and accurately</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="px-6">
            <TabsList className="w-full h-10 bg-muted/60 p-1 rounded-lg">
              <TabsTrigger value="income" className="flex-1 gap-1.5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"><ArrowDownLeft className="h-3.5 w-3.5" /> Income</TabsTrigger>
              <TabsTrigger value="expense" className="flex-1 gap-1.5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"><ArrowUpRight className="h-3.5 w-3.5" /> Expense</TabsTrigger>
              <TabsTrigger value="transfer" className="flex-1 gap-1.5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"><ArrowLeftRight className="h-3.5 w-3.5" /> Transfer</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="income" className="px-6 pb-6 pt-5 space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <F label="Category"><Select value={iCat} onValueChange={setICat}><SelectTrigger className="h-10"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{incomeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></F>
              <F label="Account"><Select value={iAcc} onValueChange={setIAcc}><SelectTrigger className="h-10"><SelectValue placeholder="Select account" /></SelectTrigger><SelectContent>{activeAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></F>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Amount"><Input type="number" placeholder="0.00" className="h-10" value={iAmt} onChange={e => setIAmt(e.target.value)} /></F>
              <F label="Date"><Input type="date" className="h-10" value={iDate} onChange={e => setIDate(e.target.value)} /></F>
            </div>
            <F label="Note"><Textarea placeholder="Add a note..." rows={2} className="resize-none" value={iNote} onChange={e => setINote(e.target.value)} /></F>
            <Button className="w-full h-10 shadow-sm font-medium" onClick={handleIncome} disabled={createTxn.isPending || !iAcc || !iAmt}>{createTxn.isPending ? "Saving..." : "Add Income"}</Button>
          </TabsContent>

          <TabsContent value="expense" className="px-6 pb-6 pt-5 space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <F label="Category"><Select value={eCat} onValueChange={setECat}><SelectTrigger className="h-10"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{expenseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></F>
              <F label="Account"><Select value={eAcc} onValueChange={setEAcc}><SelectTrigger className="h-10"><SelectValue placeholder="Select account" /></SelectTrigger><SelectContent>{activeAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></F>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Amount"><Input type="number" placeholder="0.00" className="h-10" value={eAmt} onChange={e => setEAmt(e.target.value)} /></F>
              <F label="Date"><Input type="date" className="h-10" value={eDate} onChange={e => setEDate(e.target.value)} /></F>
            </div>
            <F label="Note"><Textarea placeholder="Add a note..." rows={2} className="resize-none" value={eNote} onChange={e => setENote(e.target.value)} /></F>
            <Button className="w-full h-10 shadow-sm font-medium" onClick={handleExpense} disabled={createTxn.isPending || !eAcc || !eAmt}>{createTxn.isPending ? "Saving..." : "Add Expense"}</Button>
          </TabsContent>

          <TabsContent value="transfer" className="px-6 pb-6 pt-5 space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <F label="From Account"><Select value={tFrom} onValueChange={setTFrom}><SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{activeAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></F>
              <F label="To Account"><Select value={tTo} onValueChange={setTTo}><SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{activeAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></F>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Amount"><Input type="number" placeholder="0.00" className="h-10" value={tAmt} onChange={e => setTAmt(e.target.value)} /></F>
              <F label="Date"><Input type="date" className="h-10" value={tDate} onChange={e => setTDate(e.target.value)} /></F>
            </div>
            <F label="Transfer Fee"><Input type="number" placeholder="0.00" className="h-10" value={tFee} onChange={e => setTFee(e.target.value)} /></F>
            <F label="Note"><Textarea placeholder="Add a note..." rows={2} className="resize-none" value={tNote} onChange={e => setTNote(e.target.value)} /></F>
            <Button className="w-full h-10 shadow-sm font-medium" onClick={handleTransfer} disabled={createTxn.isPending || !tFrom || !tTo || !tAmt}>{createTxn.isPending ? "Transferring..." : "Transfer Money"}</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
