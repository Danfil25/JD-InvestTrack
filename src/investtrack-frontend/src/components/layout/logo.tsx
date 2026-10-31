import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-9 items-center justify-center rounded-lg bg-brand text-white">
        <TrendingUp className="size-5" />
      </div>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          light ? "text-white" : "text-navy",
        )}
      >
        InvestTrack
      </span>
    </div>
  );
}
