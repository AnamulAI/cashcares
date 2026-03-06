import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AccountSummary } from "@/components/accounts/AccountSummary";
import { AccountCards } from "@/components/accounts/AccountCards";
import { AddAccountModal } from "@/components/accounts/AddAccountModal";
import { AccountDetails } from "@/components/accounts/AccountDetails";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockAccounts } from "@/data/mock-data";
import type { Account } from "@/types/finance";

export default function Accounts() {
  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? mockAccounts : mockAccounts.filter(a => a.type === tab);

  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        subtitle="Manage cash, bank, wallet and business accounts"
        actions={
          <Button size="sm" className="gap-1.5 h-9" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Account
          </Button>
        }
      />

      <AccountSummary />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="cash">Cash</TabsTrigger>
          <TabsTrigger value="bank">Bank</TabsTrigger>
          <TabsTrigger value="mobile_wallet">Mobile Wallet</TabsTrigger>
          <TabsTrigger value="card">Card</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <AccountCards accounts={filtered} onViewDetails={handleViewDetails} />
        </TabsContent>
      </Tabs>

      <AddAccountModal open={addOpen} onOpenChange={setAddOpen} />
      <AccountDetails account={selectedAccount} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </div>
  );
}
