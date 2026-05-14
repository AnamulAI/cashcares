import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "mahbook.pwa.installDismissedAt";
const STALE_KEY = "mahbook.pwa.lastShellVersion";
const SHELL_VERSION = "v3"; // Bump when service worker / manifest icons change.

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as any).standalone === true
  );
}

/**
 * Surfaces:
 *  1. Native Android "Install" prompt when the browser fires beforeinstallprompt.
 *  2. A one-time toast for users running an older home-screen shortcut, asking
 *     them to remove it and reinstall so the latest manifest/icons take effect.
 *  3. Listens for `appinstalled` to confirm install success.
 */
export function PWAInstallPrompt() {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const recentlyDismissed = dismissedAt && Date.now() - dismissedAt < 7 * 86400_000;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      if (!recentlyDismissed && !isStandaloneDisplay()) setCanInstall(true);
    };

    const onInstalled = () => {
      setCanInstall(false);
      deferredRef.current = null;
      localStorage.setItem(STALE_KEY, SHELL_VERSION);
      toast.success("MahBook installed", {
        description: "Launch it from your home screen for the full app experience.",
      });
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // Detect a stale install: user is in standalone mode but their cached
    // shell version is older than the current bundle. Prompt them to refresh.
    if (isStandaloneDisplay()) {
      const last = localStorage.getItem(STALE_KEY);
      if (last && last !== SHELL_VERSION) {
        toast.info("MahBook updated", {
          description:
            "Your installed app shortcut is out of date. Remove it and reinstall to get the latest icon and offline support.",
          duration: 12000,
          action: {
            label: "Reload",
            onClick: () => window.location.reload(),
          },
        });
      }
      localStorage.setItem(STALE_KEY, SHELL_VERSION);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    const ev = deferredRef.current;
    if (!ev) return;
    try {
      await ev.prompt();
      const choice = await ev.userChoice;
      if (choice.outcome !== "accepted") {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      }
    } finally {
      deferredRef.current = null;
      setCanInstall(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setCanInstall(false);
  };

  if (!canInstall) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2",
        "flex items-center gap-3 rounded-xl border bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur",
        "max-w-[92vw]",
      )}
      role="dialog"
      aria-label="Install MahBook"
    >
      <RefreshCw className="h-4 w-4 text-primary" />
      <div className="text-xs leading-tight">
        <p className="font-semibold">Install MahBook</p>
        <p className="text-muted-foreground">Faster launch, works offline.</p>
      </div>
      <Button size="sm" className="h-8 gap-1.5" onClick={install}>
        <Download className="h-3.5 w-3.5" /> Install
      </Button>
      <button
        onClick={dismiss}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
