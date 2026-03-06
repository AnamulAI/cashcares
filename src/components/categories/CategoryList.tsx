import { MoreHorizontal, Pencil, Copy, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUpdateCategory, useDeleteCategory, useCreateCategory, type DbCategory } from "@/hooks/use-categories";

interface CategoryListProps {
  categories: DbCategory[];
  onEdit?: (cat: DbCategory) => void;
}

const groupLabels: Record<string, string> = {
  income: "Income", expense: "Expense", savings: "Savings", budget: "Budget",
  asset: "Asset", investment: "Investment", receivable: "Receivable",
  payable: "Payable", debt: "Debt", credit_card: "Credit Card",
};

export function CategoryList({ categories, onEdit }: CategoryListProps) {
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createCategory = useCreateCategory();

  const handleDuplicate = (cat: DbCategory) => {
    createCategory.mutate({
      name: `${cat.name} (copy)`,
      group: cat.group,
      icon: cat.icon,
      color: cat.color,
      parent_id: cat.parent_id,
      is_subcategory: cat.is_subcategory,
      description: cat.description,
      is_active: cat.is_active,
      usable_in_budgets: cat.usable_in_budgets,
    });
  };

  return (
    <div className="finance-card-static overflow-hidden">
      <div className="divide-y divide-border/50">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/30 transition-colors group">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}12` }}>
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{cat.name}</p>
                {cat.usable_in_budgets && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-warning/10 text-warning border-0 shrink-0">Budget</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground capitalize">{groupLabels[cat.group] || cat.group}</span>
                <span className="text-[11px] text-muted-foreground">·</span>
                <span className="text-[11px] text-muted-foreground">{cat.usage_count} transactions</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!cat.is_active && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Inactive</Badge>}
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEdit?.(cat)} className="gap-2 text-[13px]"><Pencil className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(cat)} className="gap-2 text-[13px]"><Copy className="h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => updateCategory.mutate({ id: cat.id, is_active: !cat.is_active })} className="gap-2 text-[13px]"><Archive className="h-3.5 w-3.5" /> {cat.is_active ? "Archive" : "Activate"}</DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive gap-2 text-[13px]"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{cat.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete this category. Transactions using it will keep their data but lose the category reference.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteCategory.mutate(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
