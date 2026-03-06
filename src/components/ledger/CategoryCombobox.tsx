import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/use-categories";

interface Props {
  value: string;
  onChange: (v: string) => void;
  entries: { category: string | null }[];
  /** Filter categories by group, e.g. "payable" or "receivable" */
  group?: string;
  label?: string;
}

export function CategoryCombobox({ value, onChange, entries, group, label = "Category" }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { data: allCategories = [] } = useCategories();

  // Categories from the Categories module filtered by group
  const moduleCategories = useMemo(() => {
    if (!group) return allCategories.filter(c => c.is_active);
    return allCategories.filter(c => c.is_active && c.group === group);
  }, [allCategories, group]);

  // Recently used category names from this ledger's entries
  const recentNames = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach(e => {
      if (e.category) counts.set(e.category, (counts.get(e.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
  }, [entries]);

  // Merge: recently used first, then remaining module categories
  const allOptions = useMemo(() => {
    const recentSet = new Set(recentNames);
    const moduleCatNames = moduleCategories.map(c => c.name);
    const moduleSet = new Set(moduleCatNames);
    // Recent that exist in module categories come first
    const recent = recentNames.filter(n => moduleSet.has(n));
    // Module categories not in recent
    const rest = moduleCatNames.filter(n => !recentSet.has(n));
    return { recent, rest };
  }, [recentNames, moduleCategories]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    const filterFn = (n: string) => !s || n.toLowerCase().includes(s);
    return {
      recent: allOptions.recent.filter(filterFn),
      rest: allOptions.rest.filter(filterFn),
    };
  }, [allOptions, search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasOptions = filtered.recent.length > 0 || filtered.rest.length > 0;
  const noModuleCategories = moduleCategories.length === 0;

  return (
    <div ref={wrapperRef} className="relative">
      <Label className="text-xs">{label}</Label>
      <Input
        value={value}
        onChange={e => { onChange(e.target.value); setSearch(e.target.value); }}
        onFocus={() => setOpen(true)}
        className="mt-1 h-9 text-sm"
        placeholder="Select category..."
        autoComplete="off"
        readOnly={false}
      />
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto p-1.5">
          {noModuleCategories && (
            <p className="text-[10px] text-muted-foreground px-1 py-2">
              No {group || ""} categories found. Create them in Categories page.
            </p>
          )}
          {filtered.recent.length > 0 && (
            <>
              <p className="text-[10px] text-muted-foreground px-1 mb-1 font-medium">Recently used</p>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {filtered.recent.map(cat => (
                  <Badge
                    key={cat}
                    variant={value === cat ? "default" : "secondary"}
                    className="cursor-pointer text-[11px] hover:bg-primary/10 transition-colors"
                    onClick={() => { onChange(cat); setSearch(""); setOpen(false); }}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </>
          )}
          {filtered.rest.length > 0 && (
            <>
              <p className="text-[10px] text-muted-foreground px-1 mb-1 font-medium">
                {filtered.recent.length > 0 ? "All categories" : "Categories"}
              </p>
              <div className="flex flex-wrap gap-1">
                {filtered.rest.map(cat => (
                  <Badge
                    key={cat}
                    variant={value === cat ? "default" : "secondary"}
                    className="cursor-pointer text-[11px] hover:bg-primary/10 transition-colors"
                    onClick={() => { onChange(cat); setSearch(""); setOpen(false); }}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </>
          )}
          {hasOptions && search && filtered.recent.length === 0 && filtered.rest.length === 0 && (
            <p className="text-[10px] text-muted-foreground px-1">No matches — will use "{search}"</p>
          )}
        </div>
      )}
    </div>
  );
}
