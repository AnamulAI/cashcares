import { MoreHorizontal, Eye, Pencil, Star, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/config/app";
import { cn } from "@/lib/utils";
import type { Account } from "@/types/finance";

interface AccountCardsProps {
  accounts: Account[];
  onViewDetails?: (account: Account) => void;
}

const typeLabels: Record<string, string> = {
  cash: "Cash", bank: "Bank", mobile_wallet: "Mobile Wallet",
  card: "Card", savings: "Savings", business: "Business", shared: "Shared",
};

export function AccountCards({ accounts, onViewDetails }: AccountCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <div key={account.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${account.color}15` }}>
                <div className="h-5 w-5 rounded-full" style={{ backgroundColor: account.color }} />
              </div>
              <div>
                <p className="font-semibold text-sm">{account.name}</p>
                <p className="text-xs text-muted-foreground">{typeLabels[account.type] || account.type}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => onViewDetails?.(account)}><Eye className="h-3.5 w-3.5 mr-2" /> View</DropdownMenuItem>
                <DropdownMenuItem><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                <DropdownMenuItem><Star className="h-3.5 w-3.5 mr-2" /> Set Primary</DropdownMenuItem>
                <DropdownMenuItem><Archive className="h-3.5 w-3.5 mr-2" /> Archive</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-bold font-display">{formatCurrency(account.balance)}</p>
            <p className="text-xs text-muted-foreground mt-1">{account.currency}</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {account.isPrimary && <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">Primary</Badge>}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{account.isActive ? "Active" : "Inactive"}</Badge>
            <span className="text-[10px] text-muted-foreground ml-auto">Updated {account.lastUpdated}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
