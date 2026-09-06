"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
  showText?: boolean;
  text?: string;
}

export function SignOutButton({
  className,
  showText = true,
  text = "Sign Out",
}: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (e) {
      // Continue to redirect
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer",
        className
      )}
      title="Sign Out"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <LogOut className="w-4 h-4 text-current" />
      )}
      {showText && <span>{loading ? "Signing out..." : text}</span>}
    </button>
  );
}
