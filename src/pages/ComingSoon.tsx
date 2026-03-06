import { Lock } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function ComingSoon() {
  const location = useLocation();
  const pageName = location.pathname.slice(1).replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mb-5">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold font-display">{pageName || "Coming Soon"}</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        This feature is currently under development. Stay tuned for updates!
      </p>
    </div>
  );
}
