import { MoreHorizontal, Pencil, Copy, Archive, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUpdateCategory, useDeleteCategory, useCreateCategory, type DbCategory } from "@/hooks/use-categories";
import { useTranslation } from "@/i18n/useTranslation";
import { formatNumber } from "@/lib/formatters";
import { CATEGORY_ICONS } from "./category-icons";

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

  const renderIcon = (cat: DbCategory) => {
    const iconKey = cat.icon || "";
    // Check if it's a Lucide icon key
    const LucideIcon = CATEGORY_ICONS.find(i => i.key === iconKey)?.icon;
    if (LucideIcon) {
      return <LucideIcon className="h-5 w-5" style={{ color: cat.color }} />;
    }
    // Fallback: if iconKey exists but isn't a known Lucide key (e.g. legacy emoji), show a default icon
    if (iconKey) {
      const FallbackIcon = CATEGORY_ICONS[0].icon; // Wallet
      return <FallbackIcon className="h-5 w-5" style={{ color: cat.color }} />;
    }
    // Color dot fallback
    return <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {categories.map((cat) => {
        const isSelected = selected?.has(cat.id) ?? false;
        return (
          <div
            key={cat.id}
            className={`finance-card-static relative group rounded-xl border transition-all hover:shadow-md ${
              isSelected ? "ring-2 ring-primary border-primary" : ""
            } ${!cat.is_active ? "opacity-60" : ""}`}
          >
            {/* Top actions row */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm shadow-sm">
                      <MoreHorizontal className="h-3.5 w-3.5" />
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

            {/* Checkbox */}
            {onToggleSelect && (
              <div className="absolute top-3 left-3 z-10">
                <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(cat.id)} />
              </div>
            )}

            {/* Card content */}
            <div className="p-4 flex flex-col items-center text-center gap-2.5 pt-5">
              {/* Icon chip */}
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${cat.color}18` }}
              >
                {renderIcon(cat)}
              </div>

              {/* Name */}
              <div className="min-w-0 w-full">
                <p className="text-sm font-semibold truncate">{cat.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                  {groupLabels[cat.group] || cat.group}
                </p>
              </div>

              {/* Bottom row */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{formatNumber(cat.usage_count, lang)} {t("categories.transactions")}</span>
                </div>
                {cat.usable_in_budgets && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-warning/10 text-warning border-0">
                    {t("nav.budgets")}
                  </Badge>
                )}
                {!cat.is_active && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                    {t("status.inactive")}
                  </Badge>
                )}
              </div>
            </div>

            {/* Color strip at bottom */}
            <div className="h-1 rounded-b-xl" style={{ backgroundColor: cat.color }} />
          </div>
        );
      })}
    </div>
  );
}
