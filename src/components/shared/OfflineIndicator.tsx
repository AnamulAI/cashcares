import { useEffect, useState } from "react";
import { CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Compact header chip that surfaces network status and queued sync work.
 * - Offline: red "Offline" chip
 * - Online + queued mutations: amber "Syncing N…" chip
 * - Online + idle: hidden
 * Also fires toast notifications when the network state flips.
 */
export function OfflineIndicator() {
  const online = useOnlineStatus();
  const pending = useIsMutating();
  const qc = useQueryClient();
  const [prevOnline, setPrevOnline] = useState(online);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    if (prevOnline !== online) {
      if (!online) {
        toast.warning("You're offline", {
          description: "Changes will be saved locally and synced when you reconnect.",
        });
      } else {
        toast.success("Back online", {
          description: pending > 0 ? `Syncing ${pending} pending change${pending === 1 ? "" : "s"}…` : "All changes are up to date.",
        });
        // Force a refetch of stale data once we're back online
        qc.invalidateQueries();
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 2500);
      }
      setPrevOnline(online);
    }
  }, [online, prevOnline, pending, qc]);

  if (online && pending === 0 && !justSynced) return null;

  if (!online) {
    return (
      <div
        className={cn(
          "hidden sm:flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium",
          "bg-negative/10 text-negative border border-negative/20",
        )}
        title="You are offline. Changes are queued locally."
      >
        <CloudOff className="h-3 w-3" />
        Offline
      </div>
    );
  }

  if (pending > 0) {
    return (
      <div
        className={cn(
          "hidden sm:flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium",
          "bg-warning/10 text-warning border border-warning/20",
        )}
        title={`Syncing ${pending} pending change(s)…`}
      >
        <RefreshCw className="h-3 w-3 animate-spin" />
        Syncing {pending}…
      </div>
    );
  }

  return (
    <div
      className={cn(
        "hidden sm:flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium",
        "bg-positive/10 text-positive border border-positive/20",
      )}
    >
      <CheckCircle2 className="h-3 w-3" />
      Synced
    </div>
  );
}
