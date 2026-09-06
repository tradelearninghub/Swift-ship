import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-text-primary">Sign in to your account</h2>
        <p className="text-xs text-text-secondary">
          Enter your email or mobile number to access customer portal
        </p>
      </div>

      <form className="space-y-4">
        <Input
          label="Email or Mobile"
          type="text"
          placeholder="e.g. customer@example.com or 9876543210"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
            <input type="checkbox" className="rounded border-border-default text-brand-primary focus:ring-brand-primary" />
            <span>Remember me</span>
          </label>
          <a href="#" className="text-brand-primary hover:underline font-medium">
            Forgot password?
          </a>
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Sign In
        </Button>
      </form>

      <div className="pt-4 border-t border-border-default text-center text-xs text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand-primary font-semibold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}
