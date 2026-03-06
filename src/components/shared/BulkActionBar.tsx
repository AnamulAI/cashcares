import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
  deleting?: boolean;
}

export function BulkActionBar({ selectedCount, onDelete, onClear, deleting }: BulkActionBarProps) {
  const { t } = useTranslation();
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/60 px-4 py-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <span className="text-sm font-medium">
        {selectedCount} {t("bulk.selected")}
      </span>
      <div className="h-4 w-px bg-border" />
      <Button
        variant="destructive"
        size="sm"
        className="gap-1.5 h-8 text-xs"
        onClick={onDelete}
        disabled={deleting}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {deleting ? t("common.loading") : t("bulk.deleteSelected")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 h-8 text-xs"
        onClick={onClear}
      >
        <X className="h-3.5 w-3.5" />
        {t("bulk.clearSelection")}
      </Button>
    </div>
  );
}
