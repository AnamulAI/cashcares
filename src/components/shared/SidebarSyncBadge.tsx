import { CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useIsMutating } from "@tanstack/react-query";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

/**
 * Sidebar sync status row.
 * - Offline: red row with queued count
 * - Online + queued mutations: amber "Syncing N…" row
 * - Online + idle: hidden
 * In collapsed mini sidebar, shows just the icon with a numeric dot badge.
 */
export function SidebarSyncBadge() {
  const online = useOnlineStatus();
  const pending = useIsMutating();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (online && pending === 0) return null;

  const offline = !online;
  const Icon = offline ? CloudOff : pending > 0 ? RefreshCw : CheckCircle2;
  const label = offline
    ? pending > 0
      ? `Offline · ${pending} queued`
      : "Offline"
    : `Syncing ${pending}…`;

  const tone = offline
    ? "bg-negative/10 text-negative border-negative/20"
    : "bg-warning/10 text-warning border-warning/20";

  if (collapsed) {
    return (
      <div
        className={cn(
          "relative mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg border",
          tone,
        )}
        title={label}
      >
        <Icon className={cn("h-4 w-4", !offline && pending > 0 && "animate-spin")} />
        {pending > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-negative px-1 text-[9px] font-semibold leading-none text-negative-foreground">
            {pending > 9 ? "9+" : pending}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-medium",
        tone,
      )}
      title={label}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", !offline && pending > 0 && "animate-spin")} />
      <span className="truncate">{label}</span>
    </div>
  );
}
