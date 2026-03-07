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
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

const modeStyles = {
  income: {
    tabActive: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shadow-sm",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    accent: "border-t-emerald-500",
  },
  expense: {
    tabActive: "bg-red-500/15 text-red-700 dark:text-red-400 shadow-sm",
    button: "bg-red-600 hover:bg-red-700 text-white",
    accent: "border-t-red-500",
  },
  transfer: {
    tabActive: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 shadow-sm",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    accent: "border-t-indigo-500",
  },
} as const;

type Mode = keyof typeof modeStyles;

export function QuickAddModal({ open, onOpenChange, defaultTab = "income" }: QuickAddModalProps) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createTxn = useCreateTransaction();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<Mode>(defaultTab as Mode);

  const incomeCategories = categories.filter(c => c.group === "income");
  const expenseCategories = categories.filter(c => c.group === "expense");
  const activeAccounts = accounts.filter(a => a.is_active);

  const [iCat, setICat] = useState("");
  const [iAcc, setIAcc] = useState("");
  const [iAmt, setIAmt] = useState("");
  const [iDate, setIDate] = useState(new Date().toISOString().split("T")[0]);
  const [iNote, setINote] = useState("");

  const [eCat, setECat] = useState("");
  const [eAcc, setEAcc] = useState("");
  const [eAmt, setEAmt] = useState("");
  const [eDate, setEDate] = useState(new Date().toISOString().split("T")[0]);
  const [eNote, setENote] = useState("");

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
    if (tFrom === tTo) { toast.error(t("transactions.sameAccountError")); return; }
    await createTxn.mutateAsync({ type: "transfer", category_id: null, account_id: tFrom, to_account_id: tTo, amount: Number(tAmt), date: tDate, note: tNote || null, tags: null, status: "completed", transfer_fee: Number(tFee) || 0 });
    reset(); onOpenChange(false);
  };

  const style = modeStyles[activeTab];

  const tabTriggerClass = (mode: Mode) =>
    `flex-1 gap-1.5 text-sm rounded-md transition-colors ${activeTab === mode ? style.tabActive : ""}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[520px] p-0 gap-0 overflow-hidden border-t-2 ${style.accent}`}>
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="font-display text-lg">{t("action.addRecord")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{t("transactions.quickAddDesc")}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as Mode)} className="w-full">
          <div className="px-6">
            <TabsList className="w-full h-10 bg-muted/60 p-1 rounded-lg">
              <TabsTrigger value="income" className={tabTriggerClass("income")}><ArrowDownLeft className="h-3.5 w-3.5" /> {t("transactions.income")}</TabsTrigger>
              <TabsTrigger value="expense" className={tabTriggerClass("expense")}><ArrowUpRight className="h-3.5 w-3.5" /> {t("transactions.expense")}</TabsTrigger>
              <TabsTrigger value="transfer" className={tabTriggerClass("transfer")}><ArrowLeftRight className="h-3.5 w-3.5" /> {t("action.transfer")}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="income" className="px-6 pb-6 pt-5 space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <F label={t("table.category")}><Select value={iCat} onValueChange={setICat}><SelectTrigger className="h-10"><SelectValue placeholder={t("transactions.selectCategory")} /></SelectTrigger><SelectContent>{incomeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></F>
              <F label={t("table.account")}><Select value={iAcc} onValueChange={setIAcc}><SelectTrigger className="h-10"><SelectValue placeholder={t("transactions.selectAccount")} /></SelectTrigger><SelectContent>{activeAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></F>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label={t("table.amount")}><Input type="number" placeholder="0.00" className="h-10" value={iAmt} onChange={e => setIAmt(e.target.value)} /></F>
              <F label={t("table.date")}><Input type="date" className="h-10" value={iDate} onChange={e => setIDate(e.target.value)} /></F>
            </div>
            <F label={t("table.note")}><Textarea placeholder={t("transactions.addNote")} rows={2} className="resize-none" value={iNote} onChange={e => setINote(e.target.value)} /></F>
            <Button className={`w-full h-10 shadow-sm font-medium ${style.button}`} onClick={handleIncome} disabled={createTxn.isPending || !iAcc || !iAmt}>{createTxn.isPending ? t("action.saving") : t("action.addIncome")}</Button>
          </TabsContent>

          <TabsContent value="expense" className="px-6 pb-6 pt-5 space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <F label={t("table.category")}><Select value={eCat} onValueChange={setECat}><SelectTrigger className="h-10"><SelectValue placeholder={t("transactions.selectCategory")} /></SelectTrigger><SelectContent>{expenseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></F>
              <F label={t("table.account")}><Select value={eAcc} onValueChange={setEAcc}><SelectTrigger className="h-10"><SelectValue placeholder={t("transactions.selectAccount")} /></SelectTrigger><SelectContent>{activeAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></F>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label={t("table.amount")}><Input type="number" placeholder="0.00" className="h-10" value={eAmt} onChange={e => setEAmt(e.target.value)} /></F>
              <F label={t("table.date")}><Input type="date" className="h-10" value={eDate} onChange={e => setEDate(e.target.value)} /></F>
            </div>
            <F label={t("table.note")}><Textarea placeholder={t("transactions.addNote")} rows={2} className="resize-none" value={eNote} onChange={e => setENote(e.target.value)} /></F>
            <Button className={`w-full h-10 shadow-sm font-medium ${style.button}`} onClick={handleExpense} disabled={createTxn.isPending || !eAcc || !eAmt}>{createTxn.isPending ? t("action.saving") : t("action.addExpense")}</Button>
          </TabsContent>

          <TabsContent value="transfer" className="px-6 pb-6 pt-5 space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <F label={t("transactions.fromAccount")}><Select value={tFrom} onValueChange={setTFrom}><SelectTrigger className="h-10"><SelectValue placeholder={t("transactions.selectAccount")} /></SelectTrigger><SelectContent>{activeAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></F>
              <F label={t("accounts.toAccount")}><Select value={tTo} onValueChange={setTTo}><SelectTrigger className="h-10"><SelectValue placeholder={t("transactions.selectAccount")} /></SelectTrigger><SelectContent>{activeAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></F>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label={t("table.amount")}><Input type="number" placeholder="0.00" className="h-10" value={tAmt} onChange={e => setTAmt(e.target.value)} /></F>
              <F label={t("table.date")}><Input type="date" className="h-10" value={tDate} onChange={e => setTDate(e.target.value)} /></F>
            </div>
            <F label={t("transactions.transferFee")}><Input type="number" placeholder="0.00" className="h-10" value={tFee} onChange={e => setTFee(e.target.value)} /></F>
            <F label={t("table.note")}><Textarea placeholder={t("transactions.addNote")} rows={2} className="resize-none" value={tNote} onChange={e => setTNote(e.target.value)} /></F>
            <Button className={`w-full h-10 shadow-sm font-medium ${style.button}`} onClick={handleTransfer} disabled={createTxn.isPending || !tFrom || !tTo || !tAmt}>{createTxn.isPending ? t("transactions.transferring") : t("transactions.transferMoney")}</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
