"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle, CheckCircle2, Lock, Loader2 } from "lucide-react";

function LoginForm() {
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
        setError(data.error || "Invalid email/mobile or password");
        setLoading(false);
        return;
      }

      // Successful login
      const userRole = data.user?.role;

      if (redirectParam) {
        router.push(redirectParam);
      } else if (userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "STAFF") {
        router.push("/admin");
      } else {
        router.push("/customer");
      }
      router.refresh();
    } catch (err: any) {
      setError("Network error occurred during login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-text-primary">Sign in to your account</h2>
        <p className="text-xs text-text-secondary">
          Enter your registered email or mobile number to access your portal
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email or Mobile Number"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="e.g. admin@sscourierservice.in or 8000151117"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
            />
            <span>Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-brand-primary hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
          Sign In
        </Button>
      </form>

      <div className="pt-4 border-t border-border-default text-center text-xs text-text-secondary space-y-2">
        <div>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-primary font-semibold hover:underline">
            Register here
          </Link>
        </div>
        <div className="text-[11px] text-text-muted">
          Staff or Admin?{" "}
          <Link href="/admin/login" className="text-text-secondary hover:text-brand-primary font-medium">
            Log in to Admin Operations →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
