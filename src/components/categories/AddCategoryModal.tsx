import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { FolderPlus, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateCategory, useUpdateCategory, type DbCategory } from "@/hooks/use-categories";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "./category-icons";

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory?: DbCategory | null;
}



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
  const [iconSearch, setIconSearch] = useState("");
  const [iconTab, setIconTab] = useState<"lucide" | "emoji">("lucide");
  const [customColor, setCustomColor] = useState("");

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
    setIconSearch("");
    setCustomColor("");
  }, [editCategory, open]);

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return CATEGORY_ICONS;
    const q = iconSearch.toLowerCase();
    return CATEGORY_ICONS.filter(i => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q) || i.key.includes(q));
  }, [iconSearch]);

  const iconGroups = useMemo(() => {
    const groups: Record<string, typeof CATEGORY_ICONS> = {};
    filteredIcons.forEach(i => {
      if (!groups[i.group]) groups[i.group] = [];
      groups[i.group].push(i);
    });
    return groups;
  }, [filteredIcons]);

  const isPending = createCategory.isPending || updateCategory.isPending;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(), group, icon: selectedIcon, color: selectedColor,
      parent_id: null, is_subcategory: false, description: description || null,
      is_active: isActive, usable_in_budgets: usableInBudgets,
    };
    if (isEdit && editCategory) {
      await updateCategory.mutateAsync({ id: editCategory.id, ...payload });
    } else {
      await createCategory.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const handleCustomColorApply = () => {
    if (/^#[0-9a-fA-F]{6}$/.test(customColor)) {
      setSelectedColor(customColor);
    }
  };

  // Resolve selected icon for preview
  const PreviewIcon = CATEGORY_ICONS.find(i => i.key === selectedIcon)?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
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

        <div>
          <div className="space-y-4 mt-1 pb-4">
            {/* Live Preview Card */}
            <div className="rounded-xl border bg-accent/30 p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${selectedColor}18` }}>
                {PreviewIcon ? (
                  <PreviewIcon className="h-5 w-5" style={{ color: selectedColor }} />
                ) : selectedIcon ? (
                  <span className="text-lg leading-none">{selectedIcon}</span>
                ) : (
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedColor }} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{name || "Category Name"}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{group}</p>
              </div>
              <div className="h-8 w-1 rounded-full ml-auto shrink-0" style={{ backgroundColor: selectedColor }} />
            </div>

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

            {/* Icon Picker */}
            <FieldGroup label="Icon">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border bg-muted/40 p-0.5 gap-0.5">
                    <button
                      onClick={() => setIconTab("lucide")}
                      className={cn("text-[11px] px-2.5 py-1 rounded-md transition-all font-medium", iconTab === "lucide" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                    >Icons</button>
                    <button
                      onClick={() => setIconTab("emoji")}
                      className={cn("text-[11px] px-2.5 py-1 rounded-md transition-all font-medium", iconTab === "emoji" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                    >Emoji</button>
                  </div>
                  {iconTab === "lucide" && (
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input placeholder="Search icons..." className="h-7 pl-7 text-xs" value={iconSearch} onChange={e => setIconSearch(e.target.value)} />
                    </div>
                  )}
                </div>

                {iconTab === "lucide" ? (
                  <div className="border rounded-lg p-2 max-h-[180px] overflow-y-auto space-y-2">
                    {Object.entries(iconGroups).map(([groupName, icons]) => (
                      <div key={groupName}>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 px-0.5">{groupName}</p>
                        <div className="flex flex-wrap gap-1">
                          {icons.map(item => {
                            const Icon = item.icon;
                            const isActive = selectedIcon === item.key;
                            return (
                              <button
                                key={item.key}
                                title={item.label}
                                onClick={() => setSelectedIcon(item.key)}
                                className={cn(
                                  "h-8 w-8 rounded-lg border flex items-center justify-center transition-all hover:bg-accent",
                                  isActive && "ring-2 ring-primary border-primary bg-primary/5"
                                )}
                              >
                                <Icon className="h-4 w-4" style={isActive ? { color: selectedColor } : undefined} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {filteredIcons.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No icons found</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_ICONS.map(icon => (
                      <button key={icon} onClick={() => setSelectedIcon(icon)} className={cn("h-9 w-9 rounded-lg border text-base hover:bg-accent transition-all flex items-center justify-center", selectedIcon === icon && "ring-2 ring-primary border-primary bg-primary/5")}>{icon}</button>
                    ))}
                  </div>
                )}
              </div>
            </FieldGroup>

            {/* Color Picker */}
            <FieldGroup label="Color">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={cn(
                        "h-7 w-7 rounded-full border-2 transition-all relative flex items-center justify-center",
                        selectedColor === c ? "border-foreground/40 scale-110" : "border-transparent hover:scale-110"
                      )}
                      style={{ backgroundColor: c }}
                    >
                      {selectedColor === c && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="#hex"
                    className="h-7 text-xs w-24 font-mono"
                    value={customColor}
                    onChange={e => setCustomColor(e.target.value)}
                    maxLength={7}
                  />
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={handleCustomColorApply} disabled={!/^#[0-9a-fA-F]{6}$/.test(customColor)}>
                    Apply
                  </Button>
                  <div className="h-5 w-5 rounded-full border shrink-0" style={{ backgroundColor: selectedColor }} />
                </div>
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
          </div>
        </div>

          <Button className="w-full h-10 font-medium" onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
          </Button>
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
