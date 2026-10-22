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
        <Link href="/" className="inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/ss-logo.jpg"
            alt="SS International Courier"
            className="h-14 w-auto mx-auto object-contain hover:scale-102 transition-transform"
          />
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
