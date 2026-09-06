import React from "react";
import { AlertCircle, FolderOpen, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface StateViewProps {
  state: "loading" | "empty" | "error" | "populated";
  children: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  errorMessage?: string;
  onRetry?: () => void;
  skeletonRows?: number;
  className?: string;
}

export function StateView({
  state,
  children,
  emptyTitle = "No records found",
  emptyDescription = "There is no data available to display at this time.",
  emptyAction,
  errorMessage = "Unable to load data. Please try again.",
  onRetry,
  skeletonRows = 4,
  className,
}: StateViewProps) {
  if (state === "loading") {
    return (
      <div className={cn("p-8 space-y-4 w-full", className)}>
        <div className="flex items-center justify-center p-8 text-brand-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div
              key={i}
              className="h-10 bg-slate-100 animate-pulse rounded-lg w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        className={cn(
          "p-12 text-center bg-rose-50/50 border border-rose-200 rounded-xl space-y-4 my-4",
          className
        )}
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h4 className="text-base font-semibold text-rose-900">Error Loading Data</h4>
          <p className="text-xs text-rose-700">{errorMessage}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="border-rose-300 hover:bg-rose-100">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
          </Button>
        )}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div
        className={cn(
          "p-12 text-center bg-surface-subtle border border-border-default rounded-xl space-y-4 my-4",
          className
        )}
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
          <FolderOpen className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h4 className="text-base font-semibold text-text-primary">{emptyTitle}</h4>
          <p className="text-xs text-text-secondary">{emptyDescription}</p>
        </div>
        {emptyAction && <div className="pt-2">{emptyAction}</div>}
      </div>
    );
  }

  return <>{children}</>;
}
