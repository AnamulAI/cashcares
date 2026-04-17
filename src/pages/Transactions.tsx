import { useState, useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Download, FileText, SearchX } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TransactionFilters, TransactionFilterValues, emptyFilters } from "@/components/transactions/TransactionFilters";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionDetails } from "@/components/transactions/TransactionDetails";
import { AddIncomeModal } from "@/components/transactions/AddIncomeModal";
import { AddExpenseModal } from "@/components/transactions/AddExpenseModal";
import { TransferModal } from "@/components/transactions/TransferModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/hooks/use-transactions";
import { useTranslation } from "@/i18n/useTranslation";
import { useAppContext } from "@/contexts/AppContext";
import { formatAmount } from "@/lib/formatters";
import { parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function Transactions() {
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [editTxn, setEditTxn] = useState<any>(null);
  const [filters, setFilters] = useState<TransactionFilterValues>(emptyFilters);
  const { t, lang } = useTranslation();
  const { currency } = useAppContext();

  const { data: transactions = [], isLoading } = useTransactions();

  const filtered = useMemo(() => {
    let result = transactions;
    if (activeTab !== "all") {
      result = result.filter((t: any) =>
        activeTab === "transfers" ? t.type === "transfer" : t.type === activeTab
      );
    }
    if (filters.type !== "all") {
      result = result.filter((t: any) => t.type === filters.type);
    }
    if (filters.categoryId !== "all") {
      result = result.filter((t: any) => t.category_id === filters.categoryId);
    }
    if (filters.accountId !== "all") {
      result = result.filter((t: any) =>
        t.account_id === filters.accountId || t.to_account_id === filters.accountId
      );
    }
    if (filters.status !== "all") {
      result = result.filter((t: any) => t.status === filters.status);
    }
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom ? startOfDay(parseISO(filters.dateFrom)) : new Date(0);
      const to = filters.dateTo ? endOfDay(parseISO(filters.dateTo)) : new Date(8640000000000000);
      result = result.filter((t: any) => {
        try { return isWithinInterval(parseISO(t.date), { start: from, end: to }); } catch { return true; }
      });
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter((t: any) => {
        const note = (t.note || "").toLowerCase();
        const catName = (t.category?.name || "").toLowerCase();
        const accName = (t.account?.name || "").toLowerCase();
        const type = (t.type || "").toLowerCase();
        return note.includes(q) || catName.includes(q) || accName.includes(q) || type.includes(q);
      });
    }
    return result;
  }, [transactions, activeTab, filters]);

  const totals = useMemo(() => {
    let income = 0, expense = 0;
    filtered.forEach((t: any) => {
      if (t.type === "income") income += Number(t.amount);
      else if (t.type === "expense") expense += Number(t.amount);
    });
    return { income, expense, net: income - expense };
  }, [filtered]);
  const fmt = (n: number) => formatAmount(n, currency, lang);

  const hasActiveFilters = filters.search || filters.type !== "all" || filters.categoryId !== "all" || filters.accountId !== "all" || filters.status !== "all" || filters.dateFrom || filters.dateTo;
  const showSummary = hasActiveFilters && filtered.length > 0;

  const handleViewDetails = (txn: any) => {
    setSelectedTxn(txn);
    setDetailsOpen(true);
  };

  const handleEdit = (txn: any) => {
    setEditTxn(txn);
    if (txn.type === "income") setIncomeOpen(true);
    else if (txn.type === "expense") setExpenseOpen(true);
    else if (txn.type === "transfer") setTransferOpen(true);
  };

  const handleIncomeClose = (open: boolean) => {
    setIncomeOpen(open);
    if (!open) setEditTxn(null);
  };

  const handleExpenseClose = (open: boolean) => {
    setExpenseOpen(open);
    if (!open) setEditTxn(null);
  };

  const handleTransferClose = (open: boolean) => {
    setTransferOpen(open);
    if (!open) setEditTxn(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("transactions.title")}
        subtitle={t("transactions.subtitle")}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs border-positive/30 text-positive hover:bg-positive/5 hover:text-positive" onClick={() => setIncomeOpen(true)}>
              <ArrowDownLeft className="h-3.5 w-3.5" /> {t("transactions.income")}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs border-negative/30 text-negative hover:bg-negative/5 hover:text-negative" onClick={() => setExpenseOpen(true)}>
              <ArrowUpRight className="h-3.5 w-3.5" /> {t("transactions.expense")}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs border-primary/30 text-primary hover:bg-primary/5 hover:text-primary" onClick={() => setTransferOpen(true)}>
              <ArrowLeftRight className="h-3.5 w-3.5" /> {t("action.transfer")}
            </Button>
            <div className="w-px h-5 bg-border mx-0.5" />
            <Button variant="ghost" size="sm" className="h-9 text-xs gap-1.5 text-muted-foreground">
              <Download className="h-3.5 w-3.5" /> {t("action.export")}
            </Button>
          </div>
        }
      />

      <TransactionFilters filters={filters} onChange={setFilters} />

      {showSummary && (
        <div className="finance-card-static p-3 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Income</p>
            <p className="text-sm font-semibold text-positive">{fmt(totals.income)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Expense</p>
            <p className="text-sm font-semibold text-negative">{fmt(totals.expense)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Net</p>
            <p className={`text-sm font-semibold ${totals.net >= 0 ? "text-positive" : "text-negative"}`}>{fmt(totals.net)}</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/60 p-1 h-auto gap-1">
          <TabsTrigger value="all" className="text-xs px-4 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("transactions.all")}</TabsTrigger>
          <TabsTrigger value="income" className="text-xs px-4 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("transactions.income")}</TabsTrigger>
          <TabsTrigger value="expense" className="text-xs px-4 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("transactions.expense")}</TabsTrigger>
          <TabsTrigger value="transfers" className="text-xs px-4 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("transactions.transfers")}</TabsTrigger>
          <TabsTrigger value="recurring" disabled className="text-xs px-4 py-1.5 rounded-lg opacity-40">{t("transactions.recurring")}</TabsTrigger>
          <TabsTrigger value="drafts" disabled className="text-xs px-4 py-1.5 rounded-lg opacity-40">{t("transactions.drafts")}</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
          ) : filtered.length > 0 ? (
            <TransactionTable transactions={filtered} onViewDetails={handleViewDetails} onEdit={handleEdit} />
          ) : (
            <EmptyState
              title={hasActiveFilters ? t("transactions.noMatch") : t("transactions.noFound")}
              description={hasActiveFilters ? t("transactions.adjustFilters") : t("transactions.addFirst")}
              icon={hasActiveFilters ? <SearchX className="h-7 w-7 text-muted-foreground" /> : <FileText className="h-7 w-7 text-muted-foreground" />}
              action={
                hasActiveFilters
                  ? <Button size="sm" variant="outline" onClick={() => setFilters(emptyFilters)}>{t("action.clearFilters")}</Button>
                  : <Button size="sm" onClick={() => setIncomeOpen(true)}>{t("action.addIncome")}</Button>
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <AddIncomeModal open={incomeOpen} onOpenChange={handleIncomeClose} editTransaction={editTxn?.type === "income" ? editTxn : undefined} />
      <AddExpenseModal open={expenseOpen} onOpenChange={handleExpenseClose} editTransaction={editTxn?.type === "expense" ? editTxn : undefined} />
      <TransferModal open={transferOpen} onOpenChange={handleTransferClose} editTransaction={editTxn?.type === "transfer" ? editTxn : undefined} />
      <TransactionDetails transaction={selectedTxn} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </div>
  );
}
