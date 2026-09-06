import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2 border-b border-border-default pb-4">
        <h1 className="text-h1">Terms of Service</h1>
        <p className="text-xs text-text-muted">Effective Date: September 2026</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-sm text-text-secondary leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">1. Agreement to Terms</h2>
          <p>
            By booking a parcel or utilizing multi-courier tracking services on Swift Ship Courier, you agree to these Terms of Service, rate schedules, and courier carriage conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">2. Weight & Dimension Calibration</h2>
          <p>
            Customer-submitted parcel weights and dimensions are subject to physical verification and volumetric calculation at our sorting facility. The chargeable weight is determined as the greater of actual physical weight and volumetric weight (L x W x H / 5000 cm³).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">3. Cash on Delivery (COD) Rules</h2>
          <p>
            COD amount represents the merchandise value collected from the receiver on behalf of the shipper. Shipping charges are independent fees and are not deducted unless mutually agreed under commercial terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">4. Prohibited Items</h2>
          <p>
            Shippers may not consign hazardous materials, flammable liquids, explosives, narcotics, currency notes, or contraband items under Indian Carriage of Goods laws.
          </p>
        </section>
      </div>
    </div>
  );
}
