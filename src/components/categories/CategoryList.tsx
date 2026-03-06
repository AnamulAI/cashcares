import { MoreHorizontal, Pencil, Copy, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUpdateCategory, useDeleteCategory, useCreateCategory, type DbCategory } from "@/hooks/use-categories";
import { useTranslation } from "@/i18n/useTranslation";
import { formatNumber } from "@/lib/formatters";

interface CategoryListProps {
  categories: DbCategory[];
  onEdit?: (cat: DbCategory) => void;
  selected?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export function CategoryList({ categories, onEdit, selected, onToggleSelect }: CategoryListProps) {
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createCategory = useCreateCategory();
  const { t, lang } = useTranslation();

  const groupLabels: Record<string, string> = {
    income: t("transactions.income"), expense: t("transactions.expense"), savings: t("dashboard.savings"),
    budget: t("nav.budgets"), asset: t("nav.assets"), investment: t("nav.investments"),
    receivable: t("nav.receivables"), payable: t("nav.payables"), debt: t("nav.debtLoans"),
    credit_card: t("categories.creditCard"),
  };

  const handleDuplicate = (cat: DbCategory) => {
    createCategory.mutate({
      name: `${cat.name} (${t("action.copy")})`,
      group: cat.group, icon: cat.icon, color: cat.color, parent_id: cat.parent_id,
      is_subcategory: cat.is_subcategory, description: cat.description,
      is_active: cat.is_active, usable_in_budgets: cat.usable_in_budgets,
    });
  };

  return (
    <div className="finance-card-static overflow-hidden">
      <div className="divide-y divide-border/50">
        {categories.map((cat) => {
          const isSelected = selected?.has(cat.id) ?? false;
          return (
            <div key={cat.id} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-accent/30 transition-colors group ${isSelected ? "bg-primary/5" : ""}`}>
              {onToggleSelect && (
                <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(cat.id)} />
              )}
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}12` }}>
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{cat.name}</p>
                  {cat.usable_in_budgets && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-warning/10 text-warning border-0 shrink-0">{t("nav.budgets")}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted-foreground capitalize">{groupLabels[cat.group] || cat.group}</span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">{formatNumber(cat.usage_count, lang)} {t("categories.transactions")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!cat.is_active && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t("status.inactive")}</Badge>}
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onEdit?.(cat)} className="gap-2 text-[13px]"><Pencil className="h-3.5 w-3.5" /> {t("action.edit")}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(cat)} className="gap-2 text-[13px]"><Copy className="h-3.5 w-3.5" /> {t("action.duplicate")}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => updateCategory.mutate({ id: cat.id, is_active: !cat.is_active })} className="gap-2 text-[13px]"><Archive className="h-3.5 w-3.5" /> {cat.is_active ? t("action.archive") : t("action.activate")}</DropdownMenuItem>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive gap-2 text-[13px]"><Trash2 className="h-3.5 w-3.5" /> {t("action.delete")}</DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("confirm.deleteCategory")} "{cat.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>{t("confirm.deleteCategoryDesc")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("action.cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteCategory.mutate(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("action.delete")}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}