import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config/app";

type Size = "sm" | "md" | "lg";

interface BrandLogoProps {
  size?: Size;
  showText?: boolean;
  className?: string;
}

const sizeMap: Record<Size, { box: string; text: string; name: string; tagline: string }> = {
  sm: { box: "h-8 w-8 text-[11px]", text: "text-sm", name: "text-sm", tagline: "text-[10px]" },
  md: { box: "h-9 w-9 text-[13px]", text: "text-[15px]", name: "text-[15px]", tagline: "text-[11px]" },
  lg: { box: "h-12 w-12 text-base", text: "text-2xl", name: "text-2xl", tagline: "text-xs" },
};

export function BrandLogo({ size = "md", showText = true, className }: BrandLogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl shrink-0",
          "bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600",
          "ring-1 ring-indigo-600/20 shadow-[0_2px_8px_-2px_hsl(245_58%_51%_/_0.35)]",
          "transition-transform duration-200 ease-out group-hover:scale-[1.03]",
          s.box
        )}
      >
        {/* subtle inner highlight */}
        <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent opacity-70" />
        <span className="relative font-display font-bold text-white tracking-tight leading-none">
          MB
        </span>
      </div>
      {showText && (
        <div className="min-w-0">
          <p
            className={cn(
              "font-display font-bold tracking-tight leading-none",
              "bg-gradient-to-r from-foreground to-foreground bg-clip-text",
              "group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-transparent",
              "transition-colors duration-300",
              s.name
            )}
          >
            {APP_CONFIG.name}
          </p>
          <p className={cn("text-muted-foreground/70 leading-none mt-1", s.tagline)}>
            {APP_CONFIG.tagline}
          </p>
        </div>
      )}
    </div>
  );
}
