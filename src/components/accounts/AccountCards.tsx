import { MoreHorizontal, Eye, Pencil, Star, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useUpdateAccount, useDeleteAccount, type DbAccount } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";

interface AccountCardsProps {
  accounts: DbAccount[];
  onViewDetails?: (account: DbAccount) => void;
  onEdit?: (account: DbAccount) => void;
  viewMode?: "grid" | "list";
}

export function AccountCards({ accounts, onViewDetails, onEdit, viewMode = "grid" }: AccountCardsProps) {
  const { currency, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const typeLabels: Record<string, string> = {
    cash: t("accounts.cash"), bank: t("accounts.bank"), mobile_wallet: t("accounts.mobileWallet"),
    card: t("accounts.card"), savings: t("accounts.savingsType"), business: t("accounts.business"), shared: t("accounts.shared"),
  };

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
                  {account.is_primary && <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0 shrink-0">{t("accounts.primary")}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{typeLabels[account.type] || account.type} · {account.currency}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold font-display tabular-nums">{fmt(account.balance)}</p>
                <p className="text-[11px] text-muted-foreground">{t("accounts.updated")} {fmtDate(account.updated_at)}</p>
              </div>
              <div onClick={e => e.stopPropagation()}>
                <AccountActions account={account} onViewDetails={onViewDetails} onEdit={onEdit} />
              </div>
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
            <div onClick={e => e.stopPropagation()}>
              <AccountActions account={account} onViewDetails={onViewDetails} onEdit={onEdit} />
            </div>
          </div>

          <div className="mt-5">
            <p className="text-2xl font-bold font-display tabular-nums tracking-tight">{fmt(account.balance)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{account.currency}</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {account.is_primary && <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">{t("accounts.primary")}</Badge>}
            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", account.is_active ? "bg-positive/10 text-positive border-0" : "")}>{account.is_active ? t("status.active") : t("status.inactive")}</Badge>
            <span className="text-[10px] text-muted-foreground ml-auto">{t("accounts.updated")} {fmtDate(account.updated_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountActions({ account, onViewDetails, onEdit }: { account: DbAccount; onViewDetails?: (a: DbAccount) => void; onEdit?: (a: DbAccount) => void }) {
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const { t } = useTranslation();

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onViewDetails?.(account)} className="gap-2 text-[13px]"><Eye className="h-3.5 w-3.5" /> {t("action.view")}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit?.(account)} className="gap-2 text-[13px]"><Pencil className="h-3.5 w-3.5" /> {t("action.edit")}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateAccount.mutate({ id: account.id, is_primary: true })} className="gap-2 text-[13px]"><Star className="h-3.5 w-3.5" /> {t("accounts.setPrimary")}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => updateAccount.mutate({ id: account.id, is_active: !account.is_active })} className="gap-2 text-[13px]"><Archive className="h-3.5 w-3.5" /> {account.is_active ? t("action.archive") : t("action.activate")}</DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive gap-2 text-[13px]"><Trash2 className="h-3.5 w-3.5" /> {t("action.delete")}</DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirm.deleteTitle")} "{account.name}"</AlertDialogTitle>
          <AlertDialogDescription>{t("confirm.deleteDesc")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("action.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteAccount.mutate(account.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("action.delete")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
