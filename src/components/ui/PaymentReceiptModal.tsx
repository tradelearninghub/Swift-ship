"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatPaiseToRupees, formatDate } from "@/lib/utils";
import { generateQrCodeSvg } from "@/lib/qrcode";
import { DEFAULT_COMPANY_PROFILE, CompanyProfileSettings } from "@/lib/settings";
import {
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileCheck,
  ShieldAlert,
  ArrowDownToLine,
  Truck,
  QrCode,
} from "lucide-react";

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export function PaymentReceiptModal({
  isOpen,
  onClose,
  booking,
}: PaymentReceiptModalProps) {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileSettings>(DEFAULT_COMPANY_PROFILE);

  useEffect(() => {
    fetch("/api/admin/settings?group=company_profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.setting) {
          const val = typeof data.setting === "string" ? JSON.parse(data.setting) : data.setting;
          setCompanyProfile((prev) => ({
            ...prev,
            ...val,
            support_phones: Array.isArray(val.support_phones)
              ? val.support_phones
              : val.support_phone
              ? [val.support_phone, "7689987368"]
              : prev.support_phones,
          }));
        }
      })
      .catch(() => {});
  }, []);

  if (!booking) return null;

  const charges = booking.charges || {
    shipping_charge: 0,
    additional_charge: 0,
    discount: 0,
    tax: 0,
    total: 0,
  };

  const bookingNumber = booking.booking_number || "BK-UNKNOWN";
  const receiptNumber = `REC-${bookingNumber}`;
  const awb = booking.shipment?.awb || "Pending Allocation";
  const carrierName =
    booking.shipment?.courier_partner?.name ||
    (booking.shipment?.courier_partner?.code === "IN_HOUSE"
      ? "SS Courier In-House Fleet"
      : "Counter Dispatch Fleet");

  const trackingToken = booking.shipment?.tracking_token || bookingNumber.toLowerCase();
  const trackingUrl = `https://sscourierservice.in/track/${encodeURIComponent(trackingToken)}`;
  const qrSvg = generateQrCodeSvg(trackingUrl, 96, 2);

  // Payment record resolution
  const paymentRecord =
    Array.isArray(booking.payments) && booking.payments.length > 0
      ? booking.payments[0]
      : null;

  const paymentDate = paymentRecord?.paid_at || charges.set_at || booking.updated_at || booking.created_at;
  const paymentMethod = paymentRecord?.method
    ? paymentRecord.method === "MANUAL"
      ? "Manual Cash / UPI Counter Collection"
      : paymentRecord.method
    : "Manual Cash / UPI at Counter";

  const paymentRef = paymentRecord?.gateway_reference || `CTR-PAID-${bookingNumber}`;

  // COD Separation (§9)
  const isCod = booking.payment_type === "COD" || (booking.cod_amount && booking.cod_amount > 0);
  const codAmount = booking.cod_amount || 0;

  const handlePrint = () => {
    const printContent = document.getElementById("printable-receipt-container");
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=850,height=950");
    if (!printWindow) {
      window.print();
      return;
    }

    const pageCss = `
      @page { size: A4 portrait; margin: 10mm; }
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        color: #0f172a;
        background: #ffffff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print { display: none !important; }
      .print-border { border-color: #cbd5e1 !important; }
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${receiptNumber}</title>
          <style>${pageCss}</style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-6">
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Consignment Payment Receipt"
      description={`Official Counter & Freight Collection Receipt for Booking #${bookingNumber}`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Action Header */}
        <div className="flex items-center justify-between bg-surface-subtle p-3 rounded-xl border border-border-default">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-text-primary">Receipt Ref:</span>
            <span className="font-mono font-bold text-brand-primary">{receiptNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Receipt
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Printable Canvas */}
        <div
          id="printable-receipt-container"
          className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 text-slate-800 shadow-sm"
        >
          {/* Header Section: Company Profile & Receipt Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  SS
                </div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  {companyProfile.company_name}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {companyProfile.tagline}
              </p>
              <div className="text-[11px] text-slate-600 leading-relaxed pt-1">
                <div>{companyProfile.address}</div>
                <div>
                  {companyProfile.city}, {companyProfile.state} - {companyProfile.pincode}
                </div>
                <div className="flex flex-wrap gap-x-3 pt-0.5 text-slate-700">
                  <span>
                    <strong>Helpline:</strong> {companyProfile.support_phones?.join(" / ") || "8000151117"}
                  </span>
                  <span>
                    <strong>Email:</strong> {companyProfile.support_email}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto">
              <span className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-800 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                Payment Receipt & Tax Invoice
              </span>
              <div className="font-mono text-base font-black text-blue-700 pt-1">
                {receiptNumber}
              </div>
              <div className="text-xs text-slate-500">
                Date: <strong className="text-slate-800">{formatDate(paymentDate)}</strong>
              </div>
              <div className="text-xs text-slate-500">
                Status:{" "}
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  PAID & COLLECTED
                </span>
              </div>
            </div>
          </div>

          {/* Key Consignment Identifiers Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Booking Number</div>
              <div className="font-mono font-bold text-slate-900 text-sm">{bookingNumber}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Carrier Waybill (AWB)</div>
              <div className="font-mono font-bold text-blue-700 text-sm">{awb}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Carrier</div>
              <div className="font-semibold text-slate-800 truncate">{carrierName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Payment Channel</div>
              <div className="font-semibold text-slate-800 truncate">{paymentMethod}</div>
            </div>
          </div>

          {/* Customer & Consignment Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Customer Details */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
                Customer Coordinates
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {booking.customer?.name || booking.sender_name}
              </div>
              <div className="text-slate-600 font-mono text-[11px]">
                Mobile: {booking.customer?.mobile || booking.sender_mobile}
              </div>
              {booking.customer?.email && (
                <div className="text-slate-600 truncate text-[11px]">
                  Email: {booking.customer.email}
                </div>
              )}
              <div className="text-[11px] text-slate-500 pt-1">
                Intake Mode: {booking.source || "STAFF_DIRECT"}
              </div>
            </div>

            {/* Sender (Origin) */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
                Sender (Origin)
              </div>
              <div className="font-semibold text-slate-900">
                {booking.sender_name}
              </div>
              <div className="text-slate-600 text-[11px] leading-relaxed">
                {booking.sender_address}
                {booking.sender_landmark ? `, ${booking.sender_landmark}` : ""}
              </div>
              <div className="font-medium text-slate-800 text-[11px]">
                {booking.sender_city}, {booking.sender_state} - {booking.sender_pincode}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Ph: {booking.sender_mobile}
              </div>
            </div>

            {/* Receiver (Destination) */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
                Consignee (Destination)
              </div>
              <div className="font-semibold text-slate-900">
                {booking.receiver_name}
              </div>
              <div className="text-slate-600 text-[11px] leading-relaxed">
                {booking.receiver_address}
                {booking.receiver_landmark ? `, ${booking.receiver_landmark}` : ""}
              </div>
              <div className="font-medium text-slate-800 text-[11px]">
                {booking.receiver_city}, {booking.receiver_state} - {booking.receiver_pincode}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Ph: {booking.receiver_mobile}
              </div>
            </div>
          </div>

          {/* Shipping Charge Itemized Breakdown (§16 & §36) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Itemized Freight Charge Breakdown
              </span>
              <span className="text-[11px] text-slate-500">
                Ref ID: {charges.id || "CHG-COUNTER"}
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Rate / Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2 text-slate-700">
                    Base Courier Freight Charge
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-medium">
                    {formatPaiseToRupees(charges.shipping_charge)}
                  </td>
                </tr>
                {charges.additional_charge > 0 && (
                  <tr>
                    <td className="px-4 py-2 text-slate-700">
                      Additional Handling / Remote Area Surcharge
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-medium">
                      {formatPaiseToRupees(charges.additional_charge)}
                    </td>
                  </tr>
                )}
                {charges.discount > 0 && (
                  <tr>
                    <td className="px-4 py-2 text-emerald-700">
                      Promotional Discount Applied
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-medium text-emerald-700">
                      - {formatPaiseToRupees(charges.discount)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-2 text-slate-700">
                    Goods & Services Tax (GST / Tax)
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-medium">
                    {formatPaiseToRupees(charges.tax)}
                  </td>
                </tr>
                <tr className="bg-slate-50/80 font-bold border-t-2 border-slate-200">
                  <td className="px-4 py-3 text-slate-900 text-sm">
                    Total Shipping Charge Paid
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-base text-blue-700">
                    {formatPaiseToRupees(charges.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* COD (Cash on Delivery) Distinct Separation (§9 Compliance) */}
          {isCod ? (
            <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  COD Consignment Notice (§9 Compliance)
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Collectible on Delivery</span>
                  <span className="font-mono font-black text-amber-900 text-base">
                    {formatPaiseToRupees(codAmount)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>IMPORTANT:</strong> The above COD collectible amount of{" "}
                <strong>{formatPaiseToRupees(codAmount)}</strong> is to be collected strictly upon delivery from the consignee (recipient). It is <strong>NOT</strong> part of the freight payment acknowledged in this receipt. Courier shipping charges have been settled separately above; COD remittance will be disbursed following successful parcel handover.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>PREPAID CONSIGNMENT:</strong> Full payment acknowledged. Zero collection required from consignee upon delivery.
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-800 text-xs">₹0.00 DUE AT DELIVERY</span>
            </div>
          )}

          {/* Verification & Footer Stamp */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <div
                className="w-20 h-20 bg-white border border-slate-200 rounded-lg p-1 shrink-0 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <div className="space-y-0.5 text-slate-500 text-[11px]">
                <div className="font-semibold text-slate-800">Scan to Verify Live Status</div>
                <div className="font-mono text-[10px] break-all">{trackingUrl}</div>
                <div className="text-[10px]">Payment Ref: {paymentRef}</div>
              </div>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="text-[11px] font-semibold text-slate-700">
                Authorized Counter Collector / Signatory
              </div>
              <div className="h-10 border-b border-dashed border-slate-300 w-48 mx-auto sm:ml-auto"></div>
              <div className="text-[10px] text-slate-400">
                Computer-generated electronic payment receipt. No physical signature required.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
