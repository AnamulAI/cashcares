import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionDetails } from "@/components/transactions/TransactionDetails";
import { AddIncomeModal } from "@/components/transactions/AddIncomeModal";
import { AddExpenseModal } from "@/components/transactions/AddExpenseModal";
import { TransferModal } from "@/components/transactions/TransferModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockTransactions } from "@/data/mock-data";
import type { Transaction } from "@/types/finance";

export default function Transactions() {
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const filtered = activeTab === "all"
    ? mockTransactions
    : mockTransactions.filter(t => t.type === activeTab || (activeTab === "transfers" && t.type === "transfer"));

  const handleViewDetails = (txn: Transaction) => {
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

      <TransactionFilters />

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
          {filtered.length > 0 ? (
            <TransactionTable transactions={filtered} onViewDetails={handleViewDetails} />
          ) : (
            <EmptyState
              title="No transactions found"
              description="Try adjusting your filters or add a new transaction to get started."
              icon={<FileText className="h-7 w-7 text-muted-foreground" />}
              action={
                <Button size="sm" onClick={() => setIncomeOpen(true)}>Add Transaction</Button>
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
