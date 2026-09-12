"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Truck, Package, Clock, MapPin } from "lucide-react";
import { MockTrackingEvent } from "@/lib/mockData";

export interface TimelineStep {
  status: string;
  label: string;
  description?: string;
  timestamp?: string;
  location?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface ShipmentTimelineProps {
  currentStatus: string;
  events?: any[];
  className?: string;
}

const STANDARD_STEPS = [
  { key: "BOOKED", label: "Shipment Booked" },
  { key: "PICKED_UP", label: "Picked Up" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export function ShipmentTimeline({
  currentStatus,
  events = [],
  className,
}: ShipmentTimelineProps) {
  const normStatus = currentStatus.toUpperCase();

  // Determine standard milestone index
  const statusIndexMap: Record<string, number> = {
    PROCESSING: 0,
    COURIER_ASSIGNED: 0,
    AWB_GENERATED: 0,
    BOOKED: 0,
    PICKUP_SCHEDULED: 0,
    PICKED_UP: 1,
    IN_TRANSIT: 2,
    OUT_FOR_DELIVERY: 3,
    DELIVERED: 4,
    RTO: 4,
    EXCEPTION: 2,
    CANCELLED: 0,
  };

  const currentIdx = statusIndexMap[normStatus] ?? 0;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Visual Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
        {STANDARD_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx || (idx === currentIdx && normStatus === "DELIVERED");
          const isCurrent = idx === currentIdx && normStatus !== "DELIVERED";
          const isPending = idx > currentIdx;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative group">
              {/* Connector Bar on Desktop */}
              {idx < STANDARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block absolute top-5 left-1/2 w-full h-1 -z-0 transition-colors",
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  )}
                />
              )}

              {/* Step Circle */}
              <div className="relative z-10 mb-2">
                {isCompleted ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : isCurrent ? (
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg ring-4 ring-blue-100"
                  >
                    <Truck className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 flex items-center justify-center">
                    <Circle className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Step Label */}
              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    isCompleted && "text-emerald-700",
                    isCurrent && "text-brand-primary font-bold",
                    isPending && "text-slate-400"
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <span className="inline-block text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Active Milestone
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Event Log Timeline */}
      {events.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border-default space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Detailed Activity & Checkpoint History
          </h4>

          <div className="space-y-3 relative pl-6 border-l-2 border-slate-200 ml-3">
            {events.map((ev, index) => (
              <div key={ev.id} className="relative group">
                <div
                  className={cn(
                    "absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-surface-base",
                    index === events.length - 1
                      ? "border-brand-primary bg-brand-primary ring-2 ring-blue-100"
                      : "border-slate-400"
                  )}
                />
                <div className="bg-surface-subtle p-3 rounded-lg border border-border-default space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-text-primary">
                      {ev.raw_status}
                    </span>
                    <span className="text-text-muted font-mono text-[11px]">
                      {new Date(ev.occurred_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {ev.location && (
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <MapPin className="w-3 h-3 text-brand-accent shrink-0" />
                      <span>{ev.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
