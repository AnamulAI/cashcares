import { useEffect, useState } from "react";
import { CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useIsMutating, useQueryClient, onlineManager } from "@tanstack/react-query";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";

/**
 * Full-width banner shown above the app shell.
 * - Offline: red banner ("You're offline — changes will sync automatically.")
 * - Reconnecting / has paused mutations: amber "Syncing N change(s)…"
 * - Just synced: green "All changes synced" (auto-dismisses after 2.5s)
 * - Online + idle: hidden
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const pending = useIsMutating();
  const qc = useQueryClient();
  const [pausedCount, setPausedCount] = useState(0);
  const [prevOnline, setPrevOnline] = useState(online);
  const [justSynced, setJustSynced] = useState(false);

  // Track paused mutations (queued while offline) so they show in "Syncing N…".
  useEffect(() => {
    const update = () => {
      const paused = qc.getMutationCache().getAll().filter((m) => m.state.isPaused).length;
      setPausedCount(paused);
    };
    update();
    const unsub = qc.getMutationCache().subscribe(update);
    return () => unsub();
  }, [qc]);

  // Detect transitions: offline→online with queued work shows "synced" pulse when it clears.
  useEffect(() => {
    if (prevOnline !== online) {
      setPrevOnline(online);
    }
  }, [online, prevOnline]);

  useEffect(() => {
    if (online && prevOnline === false) {
      // Came back online — wait until queue drains, then flash "synced".
      const t = setInterval(() => {
        const stillPaused = qc.getMutationCache().getAll().some((m) => m.state.isPaused || m.state.status === "pending");
        const stillMutating = onlineManager.isOnline() && pending > 0;
        if (!stillPaused && !stillMutating) {
          setJustSynced(true);
          clearInterval(t);
          setTimeout(() => setJustSynced(false), 2500);
        }
      }, 400);
      return () => clearInterval(t);
    }
  }, [online, prevOnline, pending, qc]);

  const totalQueued = pausedCount + pending;

  if (online && totalQueued === 0 && !justSynced) return null;

  let tone = "";
  let Icon = CloudOff;
  let label = "";
  let spin = false;

  if (!online) {
    tone = "bg-negative/10 text-negative border-negative/30";
    Icon = CloudOff;
    label = totalQueued > 0
      ? `You're offline — ${totalQueued} change${totalQueued === 1 ? "" : "s"} queued and will sync automatically.`
      : "You're offline — changes will be saved locally and synced when you reconnect.";
  } else if (totalQueued > 0) {
    tone = "bg-warning/10 text-warning border-warning/30";
    Icon = RefreshCw;
    spin = true;
    label = `Syncing ${totalQueued} change${totalQueued === 1 ? "" : "s"}…`;
  } else {
    tone = "bg-positive/10 text-positive border-positive/30";
    Icon = CheckCircle2;
    label = "All changes synced.";
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 border-b px-4 py-1.5 text-[12px] font-medium",
        tone,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", spin && "animate-spin")} />
      <span className="truncate">{label}</span>
    </div>
  );
}
