import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FolderPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateCategory, useUpdateCategory, type DbCategory } from "@/hooks/use-categories";

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory?: DbCategory | null;
}

const icons = ["🏠","💰","🍕","🚗","📚","🎮","💊","🛍️","⚡","✈️","🎁","📊","💼","🎓","❤️","🔧","📱","🏋️"];
const colors = ["#6366f1","#10b981","#f59e0b","#e11d48","#8b5cf6","#f97316","#06b6d4","#ec4899","#78716c","#3b82f6","#14b8a6","#a855f7"];

export function AddCategoryModal({ open, onOpenChange, editCategory }: AddCategoryModalProps) {
  const isEdit = !!editCategory;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [name, setName] = useState("");
  const [group, setGroup] = useState("expense");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("#6366f1");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [usableInBudgets, setUsableInBudgets] = useState(false);

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setGroup(editCategory.group);
      setSelectedIcon(editCategory.icon);
      setSelectedColor(editCategory.color);
      setDescription(editCategory.description || "");
      setIsActive(editCategory.is_active);
      setUsableInBudgets(editCategory.usable_in_budgets);
    } else {
      setName(""); setGroup("expense"); setSelectedIcon(null);
      setSelectedColor("#6366f1"); setDescription(""); setIsActive(true); setUsableInBudgets(false);
    }
  }, [editCategory, open]);

  const isPending = createCategory.isPending || updateCategory.isPending;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      group,
      icon: selectedIcon,
      color: selectedColor,
      parent_id: null,
      is_subcategory: false,
      description: description || null,
      is_active: isActive,
      usable_in_budgets: usableInBudgets,
    };

    if (isEdit && editCategory) {
      await updateCategory.mutateAsync({ id: editCategory.id, ...payload });
    } else {
      await createCategory.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderPlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-base">{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
              <DialogDescription className="text-xs">{isEdit ? "Update category details" : "Create a new transaction category"}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Category Name">
              <Input placeholder="e.g. Groceries" className="h-9" value={name} onChange={e => setName(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Group / Type">
              <Select value={group} onValueChange={setGroup}><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="receivable">Receivable</SelectItem>
                  <SelectItem value="payable">Payable</SelectItem>
                  <SelectItem value="debt">Debt</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup label="Icon">
            <div className="flex flex-wrap gap-1.5">
              {icons.map(icon => (
                <button key={icon} onClick={() => setSelectedIcon(icon)} className={cn("h-9 w-9 rounded-lg border text-base hover:bg-accent transition-all flex items-center justify-center", selectedIcon === icon && "ring-2 ring-primary border-primary bg-primary/5")}>{icon}</button>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Color">
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button key={c} onClick={() => setSelectedColor(c)} className={cn("h-7 w-7 rounded-full border-2 transition-all relative flex items-center justify-center", selectedColor === c ? "border-foreground/40 scale-110" : "border-transparent hover:scale-110")} style={{ backgroundColor: c }}>
                  {selectedColor === c && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Description">
            <Textarea placeholder="Optional description..." rows={2} className="resize-none" value={description} onChange={e => setDescription(e.target.value)} />
          </FieldGroup>

          <Separator />

          <div className="flex items-center justify-between">
            <div><Label className="text-sm">Active</Label><p className="text-[11px] text-muted-foreground">Show in category lists</p></div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label className="text-sm">Usable in Budgets</Label><p className="text-[11px] text-muted-foreground">Allow budget tracking</p></div>
            <Switch checked={usableInBudgets} onCheckedChange={setUsableInBudgets} />
          </div>
          <Button className="w-full h-10 font-medium" onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-medium">{label}</Label>
      {children}
    </div>
  );
}
