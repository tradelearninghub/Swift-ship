"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  Truck,
  Loader2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
} from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid administrator credentials");
        setLoading(false);
        return;
      }

      // Verify that user has an admin or staff role
      const userRole = data.user?.role;
      if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN" && userRole !== "STAFF") {
        setError(
          "Access Denied: This portal is strictly restricted to administrative personnel. Please use the Customer Portal to sign in."
        );
        setLoading(false);
        return;
      }

      // Successful Admin Login
      if (redirectParam && redirectParam.startsWith("/admin")) {
        router.push(redirectParam);
      } else {
        router.push("/admin");
      }
      router.refresh();
    } catch (err: any) {
      setError("A network error occurred while connecting to the server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-primary selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Tag */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary to-orange-500 flex items-center justify-center text-white shadow-xl shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-200">
              <Truck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-2xl text-white tracking-tight block">
                SS Courier <span className="text-brand-primary">service</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block -mt-1">
                Logistics & Parcel Management
              </span>
            </div>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 shadow-sm mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
            <span>Admin Operations Control Center</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs">
            Restricted access. Authorized logistics personnel and administrative staff only.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Identifier
              </label>
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter administrator email or mobile"
                required
                className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-brand-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-primary hover:text-orange-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-brand-primary"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 font-bold shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 flex items-center justify-center gap-2"
                isLoading={loading}
              >
                {!loading && <KeyRound className="w-4 h-4" />}
                Sign In to Admin Operations
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Customer Portal
            </Link>
            <Link
              href="/"
              className="hover:text-white transition-colors"
            >
              Back to Home →
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <p className="mt-6 text-center text-[11px] text-slate-500">
          All administrative operations and login events are monitored and logged.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
