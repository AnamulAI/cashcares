import { MoreHorizontal, Eye, Pencil, Star, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/config/app";
import { cn } from "@/lib/utils";
import type { Account } from "@/types/finance";

interface AccountCardsProps {
  accounts: Account[];
  onViewDetails?: (account: Account) => void;
  viewMode?: "grid" | "list";
}

const typeLabels: Record<string, string> = {
  cash: "Cash", bank: "Bank", mobile_wallet: "Mobile Wallet",
  card: "Card", savings: "Savings", business: "Business", shared: "Shared",
};

export function AccountCards({ accounts, onViewDetails, viewMode = "grid" }: AccountCardsProps) {
  if (viewMode === "list") {
    return (
      <div className="finance-card-static overflow-hidden">
        <div className="divide-y divide-border/50">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/30 transition-colors cursor-pointer group" onClick={() => onViewDetails?.(account)}>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${account.color}12` }}>
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: account.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{account.name}</p>
                  {account.isPrimary && <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0 shrink-0">Primary</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{typeLabels[account.type]} · {account.currency}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold font-display tabular-nums">{formatCurrency(account.balance)}</p>
                <p className="text-[11px] text-muted-foreground">Updated {account.lastUpdated}</p>
              </div>
              <AccountActions account={account} onViewDetails={onViewDetails} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <div key={account.id} className="finance-card p-5 cursor-pointer group" onClick={() => onViewDetails?.(account)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${account.color}12` }}>
                <div className="h-5 w-5 rounded-full" style={{ backgroundColor: account.color }} />
              </div>
              <div>
                <p className="font-semibold text-sm">{account.name}</p>
                <p className="text-xs text-muted-foreground">{typeLabels[account.type] || account.type}</p>
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <AccountActions account={account} onViewDetails={onViewDetails} />
            </div>
          </div>

          <div className="mt-5">
            <p className="text-2xl font-bold font-display tabular-nums tracking-tight">{formatCurrency(account.balance)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{account.currency}</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {account.isPrimary && <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">Primary</Badge>}
            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", account.isActive ? "bg-positive/10 text-positive border-0" : "")}>{account.isActive ? "Active" : "Inactive"}</Badge>
            <span className="text-[10px] text-muted-foreground ml-auto">Updated {account.lastUpdated}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountActions({ account, onViewDetails }: { account: Account; onViewDetails?: (a: Account) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onViewDetails?.(account)} className="gap-2 text-[13px]"><Eye className="h-3.5 w-3.5" /> View</DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[13px]"><Pencil className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[13px]"><Star className="h-3.5 w-3.5" /> Set Primary</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-[13px]"><Archive className="h-3.5 w-3.5" /> Archive</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive gap-2 text-[13px]"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
