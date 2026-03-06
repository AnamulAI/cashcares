import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { AddIncomeModal } from "@/components/transactions/AddIncomeModal";
import { AddExpenseModal } from "@/components/transactions/AddExpenseModal";
import { TransferModal } from "@/components/transactions/TransferModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockTransactions } from "@/data/mock-data";

export default function Transactions() {
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all"
    ? mockTransactions
    : mockTransactions.filter(t => t.type === activeTab || (activeTab === "transfers" && t.type === "transfer"));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle="Track and manage all money movement"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={() => setIncomeOpen(true)}>
              <ArrowDownLeft className="h-3.5 w-3.5 text-positive" /> Income
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={() => setExpenseOpen(true)}>
              <ArrowUpRight className="h-3.5 w-3.5 text-negative" /> Expense
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" onClick={() => setTransferOpen(true)}>
              <ArrowLeftRight className="h-3.5 w-3.5 text-primary" /> Transfer
            </Button>
            <Button variant="ghost" size="sm" className="h-9 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        }
      />

      <TransactionFilters />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="recurring" disabled className="opacity-40">Recurring</TabsTrigger>
          <TabsTrigger value="drafts" disabled className="opacity-40">Drafts</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <TransactionTable transactions={filtered} />
        </TabsContent>
      </Tabs>

      <AddIncomeModal open={incomeOpen} onOpenChange={setIncomeOpen} />
      <AddExpenseModal open={expenseOpen} onOpenChange={setExpenseOpen} />
      <TransferModal open={transferOpen} onOpenChange={setTransferOpen} />
    </div>
  );
}
