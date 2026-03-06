import { MoreHorizontal, Pencil, Copy, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Category } from "@/types/finance";

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No categories found in this group.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15` }}>
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate">{cat.name}</p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize shrink-0">{cat.group.replace('_', ' ')}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground">{cat.usageCount} uses</span>
              {!cat.isActive && <Badge variant="outline" className="text-[10px] px-1 py-0">Inactive</Badge>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
              <DropdownMenuItem><Copy className="h-3.5 w-3.5 mr-2" /> Duplicate</DropdownMenuItem>
              <DropdownMenuItem><Archive className="h-3.5 w-3.5 mr-2" /> Archive</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
