import React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Truck,
  Package,
  ArrowRightCircle,
  RotateCcw,
} from "lucide-react";

export type StatusType =
  // Booking Statuses
  | "DRAFT"
  | "REQUESTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  // Shipment Statuses
  | "PROCESSING"
  | "COURIER_ASSIGNED"
  | "AWB_GENERATED"
  | "PICKUP_SCHEDULED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RTO"
  | "EXCEPTION"
  // COD Statuses
  | "NOT_APPLICABLE"
  | "TO_COLLECT"
  | "COLLECTED"
  | "SETTLEMENT_PENDING"
  | "SETTLED"
  // Payment Statuses
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  // General
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED"
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();

  // Status mapping based on Design System §2
  let colorStyles = "bg-slate-100 text-slate-700 border-slate-200";
  let IconComponent = Clock;
  let defaultLabel = status.replace(/_/g, " ");

  switch (normalizedStatus) {
    // Neutral / Pending
    case "DRAFT":
    case "REQUESTED":
    case "UNDER_REVIEW":
    case "PENDING":
    case "TO_COLLECT":
    case "NOT_APPLICABLE":
    case "INACTIVE":
      colorStyles = "bg-slate-100 text-slate-700 border-slate-300";
      IconComponent = Clock;
      break;

    // Info / In Progress
    case "PROCESSING":
    case "COURIER_ASSIGNED":
    case "AWB_GENERATED":
    case "PICKUP_SCHEDULED":
    case "PICKED_UP":
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
    case "IN_PROGRESS":
    case "OPEN":
    case "SETTLEMENT_PENDING":
      colorStyles = "bg-blue-50 text-blue-700 border-blue-200";
      IconComponent =
        normalizedStatus === "IN_TRANSIT" || normalizedStatus === "OUT_FOR_DELIVERY"
          ? Truck
          : Package;
      break;

    // Success / Delivered / Settled
    case "APPROVED":
    case "DELIVERED":
    case "SETTLED":
    case "PAID":
    case "COLLECTED":
    case "ACTIVE":
    case "RESOLVED":
    case "CLOSED":
      colorStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
      IconComponent = CheckCircle2;
      break;

    // Warning / Exception
    case "EXCEPTION":
    case "ADDRESS_ISSUE":
    case "RECEIVER_UNAVAILABLE":
      colorStyles = "bg-amber-50 text-amber-700 border-amber-200";
      IconComponent = AlertTriangle;
      break;

    // Danger / Failure
    case "REJECTED":
    case "CANCELLED":
    case "RTO":
    case "FAILED":
    case "BLOCKED":
      colorStyles = "bg-rose-50 text-rose-700 border-rose-200";
      IconComponent = normalizedStatus === "RTO" ? RotateCcw : XCircle;
      break;

    default:
      colorStyles = "bg-slate-100 text-slate-700 border-slate-200";
      IconComponent = Clock;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider",
        colorStyles,
        className
      )}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      <span>{label || defaultLabel}</span>
    </span>
  );
}
