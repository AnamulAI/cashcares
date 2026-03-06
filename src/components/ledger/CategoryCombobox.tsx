import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Props {
  value: string;
  onChange: (v: string) => void;
  entries: { category: string | null }[];
  label?: string;
}

export function CategoryCombobox({ value, onChange, entries, label = "Category" }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Get unique categories used in this ledger, sorted by frequency
  const recentCategories = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach(e => {
      if (e.category) counts.set(e.category, (counts.get(e.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
  }, [entries]);

  const filtered = useMemo(() => {
    if (!search) return recentCategories;
    const s = search.toLowerCase();
    return recentCategories.filter(c => c.toLowerCase().includes(s));
  }, [recentCategories, search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Label className="text-xs">{label}</Label>
      <Input
        value={value}
        onChange={e => { onChange(e.target.value); setSearch(e.target.value); }}
        onFocus={() => setOpen(true)}
        className="mt-1 h-9 text-sm"
        placeholder="Type or select..."
        autoComplete="off"
      />
      {open && recentCategories.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto p-1.5">
          {filtered.length > 0 && (
            <>
              <p className="text-[10px] text-muted-foreground px-1 mb-1 font-medium">Recently used</p>
              <div className="flex flex-wrap gap-1 mb-1">
                {filtered.slice(0, 10).map(cat => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="cursor-pointer text-[11px] hover:bg-primary/10 transition-colors"
                    onClick={() => { onChange(cat); setSearch(""); setOpen(false); }}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </>
          )}
          {filtered.length === 0 && search && (
            <p className="text-[10px] text-muted-foreground px-1">No matches — will use "{search}"</p>
          )}
        </div>
      )}
    </div>
  );
}
