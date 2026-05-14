import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SNOOZE_KEY = "mahbook.pwa.updateSnoozedUntil";
const LAST_TOAST_KEY = "mahbook.pwa.lastToastAt";
const SNOOZE_MS = 6 * 60 * 60 * 1000; // 6 hours
const TOAST_THROTTLE_MS = 30 * 60 * 1000; // 30 min between toasts in same session

function logSW(event: string, detail?: Record<string, unknown>) {
  try {
    // eslint-disable-next-line no-console
    console.info(`[MahBook SW] ${event}`, detail || {});
    window.dispatchEvent(new CustomEvent("mahbook:sw-analytics", { detail: { event, ...detail } }));
  } catch {}
}

/**
 * Listens for SW lifecycle events and prompts the user to reload when a new
 * worker is waiting. Throttles repeat toasts and supports an "Update later"
 * snooze that re-prompts on next launch or after a delay.
 */
export function PWAUpdatePrompt() {
  const shownRef = useRef(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    // Lifecycle logging hooks
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () =>
        logSW("controllerchange")
      );
    }

    const triggerReload = () => {
      setReloading(true);
      logSW("skipWaiting:posted");
      try {
        waitingWorkerRef.current?.postMessage("SKIP_WAITING");
      } catch {
        window.location.reload();
      }
      // Fallback hard reload if controllerchange never fires
      setTimeout(() => window.location.reload(), 4000);
    };

    const showPrompt = (worker: ServiceWorker | undefined, opts?: { force?: boolean }) => {
      if (!worker) return;
      waitingWorkerRef.current = worker;

      // Snooze check
      const snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      if (!opts?.force && snoozedUntil && Date.now() < snoozedUntil) {
        logSW("waiting:snoozed", { snoozedUntil });
        return;
      }

      // In-session throttle
      const lastToastAt = Number(sessionStorage.getItem(LAST_TOAST_KEY) || 0);
      if (!opts?.force && lastToastAt && Date.now() - lastToastAt < TOAST_THROTTLE_MS) {
        logSW("waiting:throttled");
        return;
      }
      if (shownRef.current) return;

      shownRef.current = true;
      sessionStorage.setItem(LAST_TOAST_KEY, String(Date.now()));
      logSW("waiting:prompt-shown");

      toast("Update available", {
        description: "A new version of MahBook is ready. Reload to get the latest offline cache.",
        duration: Infinity,
        action: {
          label: "Reload",
          onClick: triggerReload,
        },
        cancel: {
          label: "Update later",
          onClick: () => {
            const until = Date.now() + SNOOZE_MS;
            localStorage.setItem(SNOOZE_KEY, String(until));
            logSW("waiting:snoozed-by-user", { until });
            shownRef.current = false;
          },
        },
        onDismiss: () => { shownRef.current = false; },
      });
    };

    const onWaiting = (e: Event) => {
      const worker = (e as CustomEvent).detail?.worker as ServiceWorker | undefined;
      logSW("waiting", { state: worker?.state });
      showPrompt(worker);
    };

    const onForceCheck = async () => {
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (!reg) { toast.info("App is up to date"); return; }
        await reg.update();
        if (reg.waiting) {
          showPrompt(reg.waiting, { force: true });
        } else {
          toast.success("You're on the latest version");
        }
      } catch {
        toast.error("Couldn't check for updates");
      }
    };

    window.addEventListener("mahbook:sw-waiting", onWaiting as EventListener);
    window.addEventListener("mahbook:sw-check", onForceCheck as EventListener);

    // On launch: if a snooze elapsed and a waiting worker is present, re-prompt.
    (async () => {
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (reg?.waiting) showPrompt(reg.waiting);
      } catch {}
    })();

    return () => {
      window.removeEventListener("mahbook:sw-waiting", onWaiting as EventListener);
      window.removeEventListener("mahbook:sw-check", onForceCheck as EventListener);
    };
  }, []);

  if (!reloading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm font-medium">Updating MahBook…</p>
      <p className="mt-1 text-xs text-muted-foreground">Applying the latest version</p>
    </div>
  );
}
