import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, MoreHorizontal, Eye, Copy, Trash2, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BulkActionBar } from "@/components/shared/BulkActionBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTransaction, useCreateTransaction } from "@/hooks/use-transactions";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const typeIcons: Record<string, any> = { income: ArrowDownLeft, expense: ArrowUpRight, transfer: ArrowLeftRight };
const typeColors: Record<string, string> = {
  income: "text-positive bg-positive/8",
  expense: "text-negative bg-negative/8",
  transfer: "text-primary bg-primary/8",
};

interface TransactionTableProps {
  transactions: any[];
  onViewDetails?: (txn: any) => void;
}

export function TransactionTable({ transactions, onViewDetails }: TransactionTableProps) {
  const deleteTxn = useDeleteTransaction();
  const createTxn = useCreateTransaction();
  const { currency, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const qc = useQueryClient();
  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const allSelected = transactions.length > 0 && selected.size === transactions.length;
  const someSelected = selected.size > 0 && selected.size < transactions.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(transactions.map((t: any) => t.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      // Reverse balances for each transaction
      for (const txn of transactions.filter((t: any) => selected.has(t.id))) {
        await deleteTxn.mutateAsync({
          id: txn.id,
          type: txn.type,
          amount: Number(txn.amount),
          account_id: txn.account_id,
          to_account_id: txn.to_account_id,
          transfer_fee: txn.transfer_fee ? Number(txn.transfer_fee) : null,
          category_id: txn.category_id,
        });
      }
      toast.success(t("bulk.deleteSuccess").replace("{count}", String(selected.size)));
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDuplicate = async (txn: any) => {
    await createTxn.mutateAsync({
      type: txn.type,
      category_id: txn.category_id || null,
      account_id: txn.account_id,
      to_account_id: txn.to_account_id || null,
      amount: Number(txn.amount),
      date: new Date().toISOString().split("T")[0],
      note: txn.note ? `${txn.note} (copy)` : null,
      tags: txn.tags || null,
      status: "completed",
      transfer_fee: txn.transfer_fee ? Number(txn.transfer_fee) : 0,
    });
    toast.success(t("transactions.duplicated"));
  };

  return (
    <div className="space-y-3">
      <BulkActionBar
        selectedCount={selected.size}
        onDelete={() => setBulkDeleteOpen(true)}
        onClear={() => setSelected(new Set())}
        deleting={bulkDeleting}
      />

      <div className="finance-card-static overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60">
              <TableHead className="w-10 h-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  className={someSelected ? "data-[state=checked]:bg-primary" : ""}
                  {...(someSelected ? { "data-state": "checked" } : {})}
                />
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10">{t("table.date")}</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10">{t("table.type")}</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10">{t("table.category")}</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10 hidden md:table-cell">{t("table.account")}</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10 hidden lg:table-cell">{t("table.note")}</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10 text-right">{t("table.amount")}</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10">{t("table.status")}</TableHead>
              <TableHead className="w-10 h-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn: any) => {
              const Icon = typeIcons[txn.type] || ArrowUpRight;
              const isSelected = selected.has(txn.id);
              return (
                <TableRow key={txn.id} className={cn("group hover:bg-accent/40 transition-colors cursor-pointer border-border/40", isSelected && "bg-primary/5")} onClick={() => onViewDetails?.(txn)}>
                  <TableCell className="py-3.5" onClick={e => e.stopPropagation()}>
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleOne(txn.id)} aria-label={`Select ${txn.id}`} />
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap py-3.5">{fmtDate(txn.date)}</TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-6 w-6 rounded-md flex items-center justify-center", typeColors[txn.type] || "")}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[13px] font-medium">{t(`transactions.${txn.type}`)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px] font-medium py-3.5">{txn.category?.name || (txn.type === "transfer" ? t("action.transfer") : "—")}</TableCell>
                  <TableCell className="text-[13px] text-muted-foreground hidden md:table-cell py-3.5">{txn.account?.name || "—"}</TableCell>
                  <TableCell className="text-[13px] text-muted-foreground hidden lg:table-cell max-w-[180px] truncate py-3.5">{txn.note || "—"}</TableCell>
                  <TableCell className={cn("text-[13px] text-right font-semibold tabular-nums py-3.5", txn.type === "income" && "text-positive", txn.type === "expense" && "text-negative", txn.type === "transfer" && "text-foreground")}>
                    {txn.type === "income" ? "+" : txn.type === "expense" ? "−" : ""}{fmt(txn.amount)}
                  </TableCell>
                  <TableCell className="py-3.5"><StatusBadge status={txn.status} /></TableCell>
                  <TableCell className="py-3.5" onClick={e => e.stopPropagation()}>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => onViewDetails?.(txn)} className="gap-2 text-[13px]"><Eye className="h-3.5 w-3.5" /> {t("action.view")}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(txn)} className="gap-2 text-[13px]"><Copy className="h-3.5 w-3.5" /> {t("action.duplicate")}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive gap-2 text-[13px]"><Trash2 className="h-3.5 w-3.5" /> {t("action.delete")}</DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("confirm.deleteTransaction")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("confirm.deleteTransactionDesc")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("action.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTxn.mutate({ id: txn.id, type: txn.type, amount: Number(txn.amount), account_id: txn.account_id, to_account_id: txn.to_account_id, transfer_fee: txn.transfer_fee ? Number(txn.transfer_fee) : null, category_id: txn.category_id })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("action.delete")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={t("bulk.deleteTitle")}
        description={t("bulk.deleteDesc").replace("{count}", String(selected.size))}
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
        confirmLabel={t("bulk.confirmDelete").replace("{count}", String(selected.size))}
      />
    </div>
  );
}
