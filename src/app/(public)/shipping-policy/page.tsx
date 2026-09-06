import React from "react";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2 border-b border-border-default pb-4">
        <h1 className="text-h1">Shipping & Delivery Policy</h1>
        <p className="text-xs text-text-muted">Effective Date: September 2026</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-sm text-text-secondary leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">1. Dispatch Timelines</h2>
          <p>
            Standard pickup requests submitted before 1:00 PM IST are collected on the same business day. Courier handovers to line-haul networks occur within 6 hours of hub intake.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">2. Transit Estimates</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Intra-City & Metro-to-Metro Express Air: 24 to 48 Hours</li>
            <li>Regional Rest of India Surface: 3 to 5 Business Days</li>
            <li>Special Economic & Remote Zones (NE / J&K / Island Territories): 5 to 7 Business Days</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">3. Delivery Attempts & Return to Origin (RTO)</h2>
          <p>
            Couriers make up to 3 verified delivery attempts with receiver telephonic coordination. In the event of non-availability, invalid address, or COD refusal, consignments are transitioned to Return to Origin (RTO) status with real-time audit notifications.
          </p>
        </section>
      </div>
    </div>
  );
}
