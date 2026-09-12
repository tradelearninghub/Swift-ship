import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2 border-b border-border-default pb-4">
        <h1 className="text-h1">Privacy Policy</h1>
        <p className="text-xs text-text-muted">Last Updated: September 2026</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-sm text-text-secondary leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">1. Information We Collect</h2>
          <p>
            When you use SS Courier service, we collect necessary consignment information including sender and receiver names, telephone numbers, delivery postal addresses, parcel contents, weight, dimensions, and declared commercial values.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">2. How We Use Consignment Data</h2>
          <p>
            Collected details are used strictly for parcel manifestation, routing via contracted courier partners (e.g. Delhivery, Blue Dart, DTDC, XpressBees), doorstep pickup, OTP-verified delivery, and Cash on Delivery (COD) fund remittance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">3. Tracking Privacy & Data Masking</h2>
          <p>
            In compliance with our privacy standards (Section 27), public tracking queries via AWB or Mobile Number display masked telephone numbers and city-level origin/destination routes only, ensuring sender and recipient personal privacy against enumeration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">4. Data Retention & Soft-Deletion</h2>
          <p>
            Transactional records, financial invoices, and Proof of Delivery (e-POD) tokens are retained in encrypted storage for statutory tax and dispute compliance windows before anonymization.
          </p>
        </section>
      </div>
    </div>
  );
}
