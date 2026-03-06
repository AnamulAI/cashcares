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

export default function Transactions() {
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [filters, setFilters] = useState<TransactionFilterValues>(emptyFilters);

  const { data: transactions = [], isLoading } = useTransactions();

  const filtered = useMemo(() => {
    let result = transactions;

    // Tab filter
    if (activeTab !== "all") {
      result = result.filter((t: any) =>
        activeTab === "transfers" ? t.type === "transfer" : t.type === activeTab
      );
    }

    // Type filter
    if (filters.type !== "all") {
      result = result.filter((t: any) => t.type === filters.type);
    }

    // Category filter
    if (filters.categoryId !== "all") {
      result = result.filter((t: any) => t.category_id === filters.categoryId);
    }

    // Account filter
    if (filters.accountId !== "all") {
      result = result.filter((t: any) =>
        t.account_id === filters.accountId || t.to_account_id === filters.accountId
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((t: any) => t.status === filters.status);
    }

    // Search filter
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

  const hasActiveFilters = filters.search || filters.type !== "all" || filters.categoryId !== "all" || filters.accountId !== "all" || filters.status !== "all";

  const handleViewDetails = (txn: any) => {
    setSelectedTxn(txn);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle="Track, filter and manage all money activity"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs border-positive/30 text-positive hover:bg-positive/5 hover:text-positive" onClick={() => setIncomeOpen(true)}>
              <ArrowDownLeft className="h-3.5 w-3.5" /> Income
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs border-negative/30 text-negative hover:bg-negative/5 hover:text-negative" onClick={() => setExpenseOpen(true)}>
              <ArrowUpRight className="h-3.5 w-3.5" /> Expense
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs border-primary/30 text-primary hover:bg-primary/5 hover:text-primary" onClick={() => setTransferOpen(true)}>
              <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
            </Button>
            <div className="w-px h-5 bg-border mx-0.5" />
            <Button variant="ghost" size="sm" className="h-9 text-xs gap-1.5 text-muted-foreground">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        }
      />

      <TransactionFilters filters={filters} onChange={setFilters} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/60 p-1 h-auto gap-1">
          <TabsTrigger value="all" className="text-xs px-4 py-1.5 rounded-lg data-[state=active]:shadow-sm">All</TabsTrigger>
          <TabsTrigger value="income" className="text-xs px-4 py-1.5 rounded-lg data-[state=active]:shadow-sm">Income</TabsTrigger>
          <TabsTrigger value="expense" className="text-xs px-4 py-1.5 rounded-lg data-[state=active]:shadow-sm">Expense</TabsTrigger>
          <TabsTrigger value="transfers" className="text-xs px-4 py-1.5 rounded-lg data-[state=active]:shadow-sm">Transfers</TabsTrigger>
          <TabsTrigger value="recurring" disabled className="text-xs px-4 py-1.5 rounded-lg opacity-40">Recurring</TabsTrigger>
          <TabsTrigger value="drafts" disabled className="text-xs px-4 py-1.5 rounded-lg opacity-40">Drafts</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
          ) : filtered.length > 0 ? (
            <TransactionTable transactions={filtered} onViewDetails={handleViewDetails} />
          ) : (
            <EmptyState
              title={hasActiveFilters ? "No transactions match your filters" : "No transactions found"}
              description={hasActiveFilters ? "Try adjusting or clearing your filters." : "Add a new transaction to get started."}
              icon={hasActiveFilters ? <SearchX className="h-7 w-7 text-muted-foreground" /> : <FileText className="h-7 w-7 text-muted-foreground" />}
              action={
                hasActiveFilters
                  ? <Button size="sm" variant="outline" onClick={() => setFilters(emptyFilters)}>Clear Filters</Button>
                  : <Button size="sm" onClick={() => setIncomeOpen(true)}>Add Transaction</Button>
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <AddIncomeModal open={incomeOpen} onOpenChange={setIncomeOpen} />
      <AddExpenseModal open={expenseOpen} onOpenChange={setExpenseOpen} />
      <TransferModal open={transferOpen} onOpenChange={setTransferOpen} />
      <TransactionDetails transaction={selectedTxn} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </div>
  );
}
