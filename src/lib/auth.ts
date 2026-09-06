import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const JWT_SECRET = process.env.AUTH_SECRET || "default_dev_auth_secret_key_minimum_32_characters_12345";
const COOKIE_NAME = "swift_ship_auth_token";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  permissions: string[];
  accountType?: "INDIVIDUAL" | "BUSINESS";
  customerId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function hasPermission(user: SessionUser | null, permissionKey: string): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  return user.permissions.includes(permissionKey);
}

export const RegisterInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  account_type: z.enum(["INDIVIDUAL", "BUSINESS"]).default("INDIVIDUAL"),
  gstin: z.string().optional(),
});

export const LoginInputSchema = z.object({
  identifier: z.string().min(1, "Email or mobile is required"),
  password: z.string().min(1, "Password is required"),
});
