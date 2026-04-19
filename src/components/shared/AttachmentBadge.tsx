import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentBadgeProps {
  count: number;
  className?: string;
}

/**
 * Inline paperclip + count indicator for table rows.
 * Renders nothing when count is 0.
 */
export function AttachmentBadge({ count, className }: AttachmentBadgeProps) {
  if (!count) return null;
  return (
    <span
      title={`${count} attachment${count === 1 ? "" : "s"}`}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground align-middle",
        className,
      )}
    >
      <Paperclip className="h-2.5 w-2.5" />
      {count}
    </span>
  );
}
