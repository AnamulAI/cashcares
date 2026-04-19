import { useEffect, useState } from "react";
import { onlineManager } from "@tanstack/react-query";

/**
 * Reactive online/offline indicator that mirrors React Query's onlineManager.
 * Returns true when the browser believes it has connectivity.
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState<boolean>(() => onlineManager.isOnline());

  useEffect(() => {
    const unsub = onlineManager.subscribe((isOnline) => setOnline(isOnline));
    return () => { unsub(); };
  }, []);

  return online;
}
