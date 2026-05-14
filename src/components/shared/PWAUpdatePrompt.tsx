import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Listens for the `mahbook:sw-waiting` event dispatched by the registration
 * script in index.html when a new service worker has installed and is waiting
 * to activate. Shows a persistent toast with a "Reload" action that tells the
 * waiting worker to skip waiting; the controllerchange listener then reloads.
 */
export function PWAUpdatePrompt() {
  const shownRef = useRef(false);

  useEffect(() => {
    const onWaiting = (e: Event) => {
      if (shownRef.current) return;
      shownRef.current = true;
      const worker: ServiceWorker | undefined = (e as CustomEvent).detail?.worker;

      toast("Update available", {
        description: "A new version of MahBook is ready. Reload to get the latest offline cache.",
        duration: Infinity,
        action: {
          label: "Reload",
          onClick: () => {
            try {
              worker?.postMessage("SKIP_WAITING");
            } catch {
              window.location.reload();
            }
          },
        },
        onDismiss: () => {
          shownRef.current = false;
        },
      });
    };

    window.addEventListener("mahbook:sw-waiting", onWaiting as EventListener);
    return () => window.removeEventListener("mahbook:sw-waiting", onWaiting as EventListener);
  }, []);

  return null;
}
