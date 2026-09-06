import React from "react";
import Link from "next/link";
import { Truck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-text-primary">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md">
            <Truck className="w-6 h-6" />
          </div>
          <span>Swift Ship<span className="text-brand-primary">.</span></span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface-base py-8 px-6 shadow-md border border-border-default rounded-2xl sm:px-10">
          {children}
        </div>
        <div className="mt-6 text-center text-xs text-text-muted">
          <Link href="/" className="hover:text-brand-primary">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
