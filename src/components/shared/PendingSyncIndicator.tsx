import { CloudOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";

interface Props {
  pending: boolean;
  className?: string;
  /** When true, renders a small label badge instead of just a dot */
  showLabel?: boolean;
}

/**
 * Subtle amber dot shown on table rows whose underlying mutation is still
 * waiting to sync to Supabase (offline queue or in-flight). Hover reveals
 * a tooltip explaining the state.
 */
export function PendingSyncIndicator({ pending, className, showLabel }: Props) {
  const online = useOnlineStatus();
  if (!pending) return null;

  const label = online ? "Syncing…" : "Waiting for connection";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 align-middle",
              className,
            )}
            aria-label={label}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning/60 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
            </span>
            {showLabel && (
              <span className="rounded-full border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                {online ? "Syncing" : "Pending"}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="flex items-center gap-1.5">
            {!online && <CloudOff className="h-3 w-3" />}
            <span>{label}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Tailwind class to subtly tint a row whose entry is pending sync. */
export const pendingRowTint = "bg-warning/[0.04] hover:bg-warning/[0.08]";
