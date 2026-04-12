import { Brain, X } from "lucide-react";
import { cn } from "../lib/utils";

export type BrainStatus = "inactive" | "loading" | "error" | "success";

type BrainStatusIconProps = {
  status: BrainStatus;
  className?: string;
  label?: string;
  progressLabel?: string;
  onClick?: () => void;
};

const statusLabels: Record<BrainStatus, string> = {
  inactive: "AI is inactive",
  loading: "AI is thinking",
  error: "AI encountered an error",
  success: "AI is ready",
};

const BrainStatusIcon = ({
  status,
  className,
  label,
  progressLabel,
  onClick,
}: BrainStatusIconProps) => {
  const statusLabel = label ?? statusLabels[status];
  const isClickable = status === "inactive" && onClick !== undefined;

  return (
    <button
      aria-label={statusLabel}
      className={cn(
        "fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-lg backdrop-blur sm:left-6 sm:top-6",
        isClickable
          ? "cursor-pointer transition-colors hover:bg-accent/20"
          : "cursor-default",
        status === "inactive" && "text-muted-foreground",
        className,
      )}
      disabled={!isClickable}
      onClick={onClick}
      title={statusLabel}
      type="button"
    >
      <div className="relative flex items-center justify-center">
        <Brain
          className={cn("h-5 w-5", status === "loading" && "animate-pulse")}
        />
        {status === "loading" && progressLabel && (
          <span className="absolute -right-3 -top-2 inline-flex min-w-8 items-center justify-center rounded-full bg-accent px-1 py-0.5 text-[9px] font-semibold leading-none text-accent-foreground shadow-sm">
            {progressLabel}
          </span>
        )}
        {status === "error" && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm">
            <X className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </div>
    </button>
  );
};

export default BrainStatusIcon;
