import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, PieChart, HandCoins, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/SectionHeader";

export function QuickActions() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <SectionHeader title="Quick Actions" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="justify-start gap-2 h-10">
          <ArrowDownLeft className="h-4 w-4 text-positive" /> Add Income
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2 h-10">
          <ArrowUpRight className="h-4 w-4 text-negative" /> Add Expense
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2 h-10">
          <ArrowLeftRight className="h-4 w-4 text-primary" /> Transfer
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2 h-10">
          <PieChart className="h-4 w-4 text-warning" /> Add Budget
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2 h-10">
          <HandCoins className="h-4 w-4 text-primary" /> Receivable
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2 h-10">
          <CreditCard className="h-4 w-4 text-warning" /> Payable
        </Button>
      </div>
    </div>
  );
}
