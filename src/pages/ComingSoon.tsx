import { Lock } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function ComingSoon() {
  const location = useLocation();
  const pageName = location.pathname.slice(1).replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8 mb-6">
        <Lock className="h-7 w-7 text-primary/40" />
      </div>
      <h1 className="text-xl font-semibold font-display tracking-tight">{pageName || "Coming Soon"}</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
        This module is currently under development. We'll notify you when it's ready.
      </p>
    </div>
  );
}