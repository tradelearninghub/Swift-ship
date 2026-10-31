"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface NavAuthButtonProps {
  initialUser?: NavUser | null;
  variant?: "desktop" | "mobile";
}

export function NavAuthButton({
  initialUser = null,
  variant = "desktop",
}: NavAuthButtonProps) {
  const [user, setUser] = useState<NavUser | null>(initialUser);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setUser(data.user || null);
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch {
        // preserve current state on error
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const isLoggedIn = Boolean(user);

  if (variant === "mobile") {
    if (isLoggedIn) {
      return (
        <Link
          href="/book"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C58B24] text-white font-bold text-xs shadow-xs hover:bg-[#b07b1d] transition-colors"
        >
          <i className="fas fa-box-open text-xs !mr-0"></i>
          <span>Book a Parcel</span>
        </Link>
      );
    }
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C58B24] text-white font-bold text-xs shadow-xs hover:bg-[#b07b1d] transition-colors"
      >
        <i className="fas fa-sign-in-alt text-xs !mr-0"></i>
        <span>Login</span>
      </Link>
    );
  }

  // Desktop variant
  if (isLoggedIn) {
    return (
      <Link
        href="/book"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C58B24] hover:bg-[#b07b1d] text-white font-bold text-sm shadow-md shadow-[#C58B24]/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <i className="fas fa-box-open text-xs !mr-0"></i>
        <span>Book a Parcel</span>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C58B24] hover:bg-[#b07b1d] text-white font-bold text-sm shadow-md shadow-[#C58B24]/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
    >
      <i className="fas fa-sign-in-alt text-xs !mr-0"></i>
      <span>Login</span>
    </Link>
  );
}
