import { PageHeader } from "@/components/shared/PageHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { SecondaryCards } from "@/components/dashboard/SecondaryCards";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { DistributionChart } from "@/components/dashboard/DistributionChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { QuickAddModal } from "@/components/layout/QuickAddModal";

export default function Dashboard() {
  const [quickAdd, setQuickAdd] = useState(false);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard"
        subtitle="Full overview of your money activity"
        actions={
          <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => setQuickAdd(true)}>
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        }
      />

      <SummaryCards />
      <SecondaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3"><TrendChart /></div>
        <div className="lg:col-span-2"><DistributionChart /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuickActions />
        <AlertsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3"><RecentTransactions /></div>
        <div className="lg:col-span-2"><BudgetProgress /></div>
      </div>

      <QuickAddModal open={quickAdd} onOpenChange={setQuickAdd} />
    </div>
  );
}