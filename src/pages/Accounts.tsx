import { useState } from "react";
import { Plus, Search, LayoutGrid, List, Wallet2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AccountSummary } from "@/components/accounts/AccountSummary";
import { AccountCards } from "@/components/accounts/AccountCards";
import { AddAccountModal } from "@/components/accounts/AddAccountModal";
import { AccountDetails } from "@/components/accounts/AccountDetails";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAccounts } from "@/data/mock-data";
import type { Account } from "@/types/finance";

export default function Accounts() {
  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = mockAccounts
    .filter(a => tab === "all" || a.type === tab)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()));

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="bg-muted/60 p-1 h-auto gap-1 overflow-x-auto">
            <TabsTrigger value="all" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">All</TabsTrigger>
            <TabsTrigger value="cash" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">Cash</TabsTrigger>
            <TabsTrigger value="bank" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">Bank</TabsTrigger>
            <TabsTrigger value="mobile_wallet" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">Mobile Wallet</TabsTrigger>
            <TabsTrigger value="card" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">Card</TabsTrigger>
            <TabsTrigger value="savings" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">Savings</TabsTrigger>
            <TabsTrigger value="business" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">Business</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search accounts..." className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="balance">Highest Balance</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode("grid")}>
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode("list")}>
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <TabsContent value={tab} className="mt-4">
          {filtered.length > 0 ? (
            <AccountCards accounts={filtered} onViewDetails={handleViewDetails} viewMode={viewMode} />
          ) : (
            <EmptyState
              title="No accounts found"
              description="Add your first account to start tracking your finances."
              icon={<Wallet2 className="h-7 w-7 text-muted-foreground" />}
              action={<Button size="sm" onClick={() => setAddOpen(true)}>Add Account</Button>}
            />
          )}
        </TabsContent>
      </Tabs>

      <AddAccountModal open={addOpen} onOpenChange={setAddOpen} />
      <AccountDetails account={selectedAccount} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </div>
  );
}
