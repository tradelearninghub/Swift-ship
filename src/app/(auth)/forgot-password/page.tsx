"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Lock,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step 1: Request Reset Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to find registered account");
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message);
      if (data.demoResetCode) {
        setResetCode(data.demoResetCode);
      }
      setStep(2);
      setLoading(false);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // Step 2: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          code: resetCode.trim(),
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update password");
        setLoading(false);
        return;
      }

      setStep(3);
      setLoading(false);
    } catch (err) {
      setError("Network error while resetting password.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-text-primary">
          {step === 1
            ? "Reset your password"
            : step === 2
            ? "Enter code & new password"
            : "Password Reset Complete"}
        </h2>
        <p className="text-xs text-text-secondary">
          {step === 1
            ? "Enter your registered email or 10-digit mobile number to receive a verification code"
            : step === 2
            ? "Create a new strong password for your SS Courier account"
            : "Your account password has been updated securely"}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Request Code */}
      {step === 1 && (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <Input
            label="Registered Email or Mobile"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. customer@example.com or 9876543210"
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Send Verification Code
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}

      {/* STEP 2: Enter Code & New Password */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-semibold">{successMsg}</span>
                {resetCode && (
                  <div className="mt-1 font-mono text-[11px] text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Verification code: <strong>{resetCode}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          <Input
            label="6-Digit Verification Code"
            type="text"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            placeholder="e.g. 123456"
            maxLength={6}
            required
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Update Password
          </Button>

          <div className="flex justify-between items-center pt-2 text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-text-secondary hover:text-text-primary"
            >
              ← Change email/mobile
            </button>
            <Link href="/login" className="text-brand-primary font-semibold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}

      {/* STEP 3: Confirmation Success */}
      {step === 3 && (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Password Updated Successfully</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            You can now log in to your SS Courier account using your newly set password.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Proceed to Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
