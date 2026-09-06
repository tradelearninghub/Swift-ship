"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Building2, User, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<"INDIVIDUAL" | "BUSINESS">("INDIVIDUAL");
  const [registered, setRegistered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistered(true);
  };

  if (registered) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Account Created Successfully</h2>
        <p className="text-xs text-text-secondary">
          Welcome to Swift Ship Courier. You can now log in to access your self-service portal.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="primary" className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-text-primary">Create an account</h2>
        <p className="text-xs text-text-secondary">
          Join thousands of shippers using Swift Ship for reliable multi-carrier logistics
        </p>
      </div>

      {/* Account Type Switcher (§17a) */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-surface-subtle border border-border-default rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setAccountType("INDIVIDUAL")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
            accountType === "INDIVIDUAL"
              ? "bg-surface-base text-brand-primary shadow-sm font-bold"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <User className="w-3.5 h-3.5" /> Individual
        </button>
        <button
          type="button"
          onClick={() => setAccountType("BUSINESS")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
            accountType === "BUSINESS"
              ? "bg-surface-base text-brand-primary shadow-sm font-bold"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Business / B2B
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={accountType === "BUSINESS" ? "Company / Legal Business Name" : "Full Name"}
          type="text"
          placeholder={accountType === "BUSINESS" ? "Acme Logistics Pvt Ltd" : "Rahul Sharma"}
          required
        />
        <Input
          label="Mobile Number"
          type="tel"
          placeholder="10-digit mobile number"
          maxLength={10}
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          required
        />

        {accountType === "BUSINESS" && (
          <Input
            label="GSTIN (Goods & Services Tax ID)"
            type="text"
            placeholder="e.g. 08AAAAA0000A1Z5"
            helperText="Required for GST tax invoicing and business input credits"
            required
          />
        )}

        <Input
          label="Password"
          type="password"
          placeholder="Create strong password (min 8 chars)"
          required
        />

        <div className="text-xs text-text-secondary leading-relaxed">
          By registering, you agree to our{" "}
          <Link href="/terms" className="text-brand-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-brand-primary hover:underline">
            Privacy Policy
          </Link>.
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Create {accountType === "BUSINESS" ? "Business" : "Customer"} Account
        </Button>
      </form>

      <div className="pt-4 border-t border-border-default text-center text-xs text-text-secondary">
        Already registered?{" "}
        <Link href="/login" className="text-brand-primary font-semibold hover:underline">
          Sign In here
        </Link>
      </div>
    </div>
  );
}
