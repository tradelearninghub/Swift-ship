"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MockBooking } from "@/lib/mockData";
import { formatPaiseToRupees, formatGramsToKg } from "@/lib/utils";
import { generateCode128Svg } from "@/lib/barcode";
import { generateQrCodeSvg } from "@/lib/qrcode";
import { DEFAULT_COMPANY_PROFILE, CompanyProfileSettings } from "@/lib/settings";
import {
  Printer,
  Download,
  Truck,
  ShieldCheck,
  CheckCircle2,
  FileText,
  RotateCcw,
  Maximize2,
} from "lucide-react";

export type LabelSize = "4x6" | "A4";

interface ReceiptLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export function ReceiptLabelModal({
  isOpen,
  onClose,
  booking,
}: ReceiptLabelModalProps) {
  const [labelSize, setLabelSize] = useState<LabelSize>("4x6");
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

  const parcel = booking.parcels[0];
  const weightGrams =
    parcel?.verified_weight_grams ?? parcel?.submitted_weight_grams ?? 0;
  const lengthCm =
    parcel?.verified_length_cm ?? parcel?.submitted_length_cm ?? 0;
  const widthCm = parcel?.verified_width_cm ?? parcel?.submitted_width_cm ?? 0;
  const heightCm =
    parcel?.verified_height_cm ?? parcel?.submitted_height_cm ?? 0;

  const awb = booking.shipment?.awb || `AWB${booking.booking_number.replace(/[^0-9]/g, "") || "98765432"}`;
  const courier = booking.shipment?.courier_name || "Assigned Carrier";
  const token = booking.shipment?.tracking_token || `tok_${booking.booking_number.toLowerCase()}`;
  const trackingUrl = `https://sscourierservice.in/track/${encodeURIComponent(token)}`;

  const phone1 = companyProfile.support_phones?.[0] || "8000151117";
  const phone2 = companyProfile.support_phones?.[1] || "7689987368";
  const returnAddress = `${companyProfile.address}, ${companyProfile.city}, ${companyProfile.state} - ${companyProfile.pincode}`;

  const barcodeSvg = generateCode128Svg(awb, { height: 42, barWidth: 1.8 });
  const qrSvg = generateQrCodeSvg(trackingUrl, 110);
  const qrSvgSmall = generateQrCodeSvg(trackingUrl, 80);

  // Print handler with size-specific @page media query
  const handlePrint = () => {
    const printContent = document.getElementById("printable-label-container");
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      window.print();
      return;
    }

    const is4x6 = labelSize === "4x6";
    const pageCss = is4x6
      ? `@page { size: 100mm 150mm; margin: 3mm; } body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }`
      : `@page { size: A4 portrait; margin: 8mm; } body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label - ${awb}</title>
          <style>
            ${pageCss}
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #fff; }
            .print-wrapper { width: 100%; max-width: ${is4x6 ? "100mm" : "190mm"}; margin: 0 auto; }
          </style>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
        </head>
        <body>
          <div class="print-wrapper">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download PDF handler
  const handleDownloadPdf = () => {
    // Triggers direct print-to-PDF dialogue
    handlePrint();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shipping Label & Dispatch Receipt (§60)"
      description={`Generate scannable courier labels and dispatch slips for booking #${booking.booking_number}`}
      maxWidth="4xl"
    >
      <div className="space-y-5 text-xs">
        {/* Size Selection Tabs (§2 Size Options: 4x6 Thermal vs A4) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-surface-subtle border border-border-default rounded-xl">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-primary text-xs">Label Size Option:</span>
            <div className="inline-flex rounded-lg border border-border-default bg-white p-0.5">
              <button
                type="button"
                onClick={() => setLabelSize("4x6")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  labelSize === "4x6"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                4x6 Inch (100x150mm Thermal)
              </button>
              <button
                type="button"
                onClick={() => setLabelSize("A4")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  labelSize === "A4"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                A4 Full Page (Office / Invoice)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5 mr-1" /> Print Slip
            </Button>
          </div>
        </div>

        {/* Printable Label Canvas Area */}
        <div className="max-h-[65vh] overflow-y-auto p-1 rounded-xl border border-slate-200 bg-slate-100/60 flex justify-center">
          <div id="printable-label-container" className="w-full">
            {/* ============================================================== */}
            {/* 1. 4x6 INCH / 100x150MM THERMAL LABEL TEMPLATE */}
            {/* ============================================================== */}
            {labelSize === "4x6" ? (
              <div
                style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}
                className="bg-white border-2 border-slate-900 rounded-lg p-3 text-slate-900 font-sans shadow-sm space-y-2 text-[11px] leading-tight"
              >
                {/* Header: Carrier Badge & Company Info */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                  <div>
                    <div className="text-xs font-extrabold tracking-wide uppercase">
                      {companyProfile.company_name}
                    </div>
                    <div className="text-[9px] text-slate-600">
                      Ph: {phone1} • www.sscourierservice.in
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold uppercase text-slate-500">Carrier Assigned</div>
                    <div className="text-sm font-black text-blue-900 uppercase tracking-tight">
                      {courier}
                    </div>
                  </div>
                </div>

                {/* Routing Box: Large Scannable Destination Pincode */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900 text-white p-2 rounded items-center">
                  <div className="text-center border-r border-slate-700 pr-1">
                    <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Origin</div>
                    <div className="font-mono font-bold text-xs">{booking.sender_pincode}</div>
                    <div className="text-[8px] text-slate-300 truncate">{booking.sender_city}</div>
                  </div>
                  <div className="col-span-2 text-center pl-1">
                    <div className="text-[8px] uppercase tracking-widest text-amber-400 font-extrabold">
                      ★ DESTINATION PINCODE ★
                    </div>
                    <div className="text-xl font-black font-mono tracking-wider text-amber-300">
                      {booking.receiver_pincode}
                    </div>
                    <div className="text-[9px] font-bold text-slate-200 uppercase">
                      {booking.receiver_city}, {booking.receiver_state}
                    </div>
                  </div>
                </div>

                {/* Vector Barcode (AWB Number) */}
                <div className="p-1 bg-white border border-slate-300 rounded text-center">
                  <div
                    className="w-full overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                  />
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    Order Ref: <strong>#{booking.booking_number}</strong> • Date:{" "}
                    {new Date(booking.created_at).toLocaleDateString("en-IN")}
                  </div>
                </div>

                {/* Receiver (TO) Block */}
                <div className="p-2 border-2 border-slate-900 rounded bg-amber-50/40 space-y-0.5">
                  <div className="text-[9px] font-extrabold uppercase text-slate-500">
                    SHIP TO (CONSIGNEE):
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">{booking.receiver_name}</div>
                  <div className="text-[10px] text-slate-800 leading-snug">{booking.receiver_address}</div>
                  <div className="font-bold text-[10px] text-slate-900 pt-0.5">
                    {booking.receiver_city}, {booking.receiver_state} -{" "}
                    <span className="bg-amber-300 px-1 py-0.2 rounded font-black font-mono">
                      {booking.receiver_pincode}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold font-mono text-slate-900 pt-0.5">
                    Mobile: {booking.receiver_mobile}
                  </div>
                </div>

                {/* Parcel Metrics & Payment Type */}
                <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 border border-slate-300 rounded text-[10px]">
                  <div>
                    <div className="text-slate-500 font-semibold">Weight:</div>
                    <div className="font-bold font-mono text-xs">{formatGramsToKg(weightGrams)}</div>
                    <div className="text-[9px] text-slate-600 font-mono">
                      {lengthCm}x{widthCm}x{heightCm} cm
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-semibold">Payment:</div>
                    <div className="font-bold uppercase text-xs">{booking.payment_type}</div>
                    {booking.payment_type === "COD" ? (
                      <div className="text-rose-700 font-black font-mono text-[11px] leading-tight">
                        COLLECT: {formatPaiseToRupees(booking.cod_amount)}
                      </div>
                    ) : (
                      <div className="text-emerald-700 font-bold font-mono">PREPAID</div>
                    )}
                  </div>
                  <div>
                    <div className="text-slate-500 font-semibold">Charges:</div>
                    <div className="font-bold font-mono">
                      {booking.charges ? formatPaiseToRupees(booking.charges.total) : "Verified"}
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Decl: {formatPaiseToRupees(parcel?.declared_value || 0)}
                    </div>
                  </div>
                </div>

                {/* Return Address & Shipper Info */}
                <div className="grid grid-cols-2 gap-2 border-t border-slate-300 pt-1.5 text-[9px] leading-tight">
                  <div>
                    <div className="font-bold uppercase text-slate-500">Shipper (From):</div>
                    <div className="font-bold text-slate-800">{booking.sender_name}</div>
                    <div className="text-slate-600 truncate">{booking.sender_city}, {booking.sender_pincode}</div>
                    <div className="font-mono text-slate-700">Ph: {booking.sender_mobile}</div>
                  </div>
                  <div>
                    <div className="font-bold uppercase text-rose-700">If Undelivered Return To:</div>
                    <div className="text-slate-700 font-semibold leading-tight">{returnAddress}</div>
                    <div className="text-slate-700 font-mono">Helpline: {phone1}</div>
                  </div>
                </div>

                {/* Footer QR Tracking Code */}
                <div className="flex items-center justify-between border-t border-slate-300 pt-1.5">
                  <div className="space-y-0.5 max-w-[280px]">
                    <div className="font-bold text-[10px] text-slate-900 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Scan QR for Live Tracking (§29)
                    </div>
                    <div className="text-[8px] text-slate-500 font-mono truncate">
                      {trackingUrl}
                    </div>
                  </div>
                  <div
                    className="p-1 bg-white border border-slate-300 rounded shrink-0"
                    dangerouslySetInnerHTML={{ __html: qrSvgSmall }}
                  />
                </div>
              </div>
            ) : (
              /* ============================================================== */
              /* 2. A4 FULL PAGE DISPATCH RECEIPT & SHIPPING LABEL TEMPLATE     */
              /* ============================================================== */
              <div
                style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
                className="bg-white border-2 border-slate-900 rounded-xl p-6 text-slate-900 font-sans shadow-md space-y-6 text-xs"
              >
                {/* TOP HALF: Official Consignment Dispatch Receipt */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                            {companyProfile.company_name}
                          </h2>
                          <div className="text-[10px] text-slate-600 font-mono">
                            Multi-Carrier Logistics & Parcel Express • Hub: {companyProfile.city}, {companyProfile.pincode}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase bg-slate-900 text-white px-2 py-0.5 rounded">
                        Consignment Dispatch Receipt
                      </span>
                      <div className="text-sm font-bold font-mono text-brand-primary mt-1">
                        #{booking.booking_number}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Date: {new Date(booking.created_at).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Summary Breakdown Table */}
                  <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-lg p-3 bg-slate-50/70">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Shipper (Sender)</div>
                      <div className="font-bold text-slate-900">{booking.sender_name}</div>
                      <div className="text-slate-600">{booking.sender_address}</div>
                      <div className="font-semibold text-slate-800">
                        {booking.sender_city}, {booking.sender_state} - {booking.sender_pincode}
                      </div>
                      <div className="font-mono text-[11px]">Ph: {booking.sender_mobile}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Consignee (Receiver)</div>
                      <div className="font-bold text-slate-900">{booking.receiver_name}</div>
                      <div className="text-slate-600">{booking.receiver_address}</div>
                      <div className="font-bold text-slate-800">
                        {booking.receiver_city}, {booking.receiver_state} - {booking.receiver_pincode}
                      </div>
                      <div className="font-mono text-[11px]">Ph: {booking.receiver_mobile}</div>
                    </div>
                  </div>

                  {/* Financial & Weight Summary */}
                  <div className="grid grid-cols-4 gap-3 bg-slate-100 p-3 rounded-lg border border-slate-200 text-center">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-500">Carrier / Mode</div>
                      <div className="font-bold text-slate-900 uppercase">{courier}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Surface Cargo</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-500">Chargeable Weight</div>
                      <div className="font-bold font-mono text-slate-900">{formatGramsToKg(weightGrams)}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {lengthCm}x{widthCm}x{heightCm} cm
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-500">Payment Type</div>
                      <div className="font-bold text-slate-900 uppercase">{booking.payment_type}</div>
                      {booking.payment_type === "COD" && (
                        <div className="font-bold font-mono text-rose-700">
                          COD: {formatPaiseToRupees(booking.cod_amount)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-500">Total Shipping Charge</div>
                      <div className="font-extrabold font-mono text-brand-primary text-sm">
                        {booking.charges ? formatPaiseToRupees(booking.charges.total) : "Verified in Review"}
                      </div>
                      <div className="text-[9px] text-slate-500">Inclusive of GST</div>
                    </div>
                  </div>

                  {/* Signature line & terms */}
                  <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500">
                    <div>
                      <div>Customer Helpline: +91 {phone1} / {phone2}</div>
                      <div>Terms: Handled subject to conditions on https://sscourierservice.in/terms</div>
                    </div>
                    <div className="text-right border-t border-slate-400 pt-1 w-44">
                      Authorized Signatory / Hub Stamp
                    </div>
                  </div>
                </div>

                {/* Perforated Cut Line */}
                <div className="relative border-t-2 border-dashed border-slate-400 my-4 text-center">
                  <span className="bg-white px-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest relative -top-2.5">
                    ✂ Cut Along Line & Affix Shipping Label Below to Parcel ✂
                  </span>
                </div>

                {/* BOTTOM HALF: Physical Package Shipping Label */}
                <div className="border-2 border-slate-900 rounded-lg p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                    <div className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
                      {companyProfile.company_name}
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold uppercase text-slate-500">Carrier Partner</div>
                      <div className="font-black text-base text-blue-900 uppercase tracking-tight">
                        {courier}
                      </div>
                    </div>
                  </div>

                  {/* Destination Pincode Highlight Box */}
                  <div className="flex items-center justify-between bg-slate-900 text-white p-2.5 rounded">
                    <div className="text-left">
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Origin</div>
                      <div className="font-mono font-bold text-sm">
                        {booking.sender_city} ({booking.sender_pincode})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-widest text-amber-400 font-extrabold">
                        ★ DESTINATION HUB PINCODE ★
                      </div>
                      <div className="text-2xl font-black font-mono text-amber-300">
                        {booking.receiver_pincode}
                      </div>
                    </div>
                  </div>

                  {/* Vector Barcode & AWB Display */}
                  <div className="p-2 bg-slate-50 border border-slate-300 rounded text-center space-y-1">
                    <div
                      className="w-full overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                    />
                    <div className="text-[10px] font-mono text-slate-600">
                      Consignment Reference: <strong>#{booking.booking_number}</strong>
                    </div>
                  </div>

                  {/* Sender & Receiver Split */}
                  <div className="grid grid-cols-2 gap-4 border-y border-slate-300 py-3">
                    <div className="space-y-1 pr-3 border-r border-slate-200">
                      <div className="text-[10px] font-bold uppercase text-slate-400">From (Shipper):</div>
                      <div className="font-bold text-slate-900">{booking.sender_name}</div>
                      <div className="text-slate-600 leading-snug">{booking.sender_address}</div>
                      <div className="font-semibold text-slate-800">
                        {booking.sender_city}, {booking.sender_state} - {booking.sender_pincode}
                      </div>
                      <div className="font-mono text-slate-700">Ph: {booking.sender_mobile}</div>
                    </div>

                    <div className="space-y-1 pl-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Deliver To:</div>
                      <div className="font-bold text-slate-900 text-sm">{booking.receiver_name}</div>
                      <div className="text-slate-600 leading-snug">{booking.receiver_address}</div>
                      <div className="font-bold text-slate-900">
                        {booking.receiver_city}, {booking.receiver_state} -{" "}
                        <span className="bg-yellow-200 px-1 py-0.5 rounded font-black font-mono">
                          {booking.receiver_pincode}
                        </span>
                      </div>
                      <div className="font-mono font-bold text-slate-900">Ph: {booking.receiver_mobile}</div>
                    </div>
                  </div>

                  {/* Undelivered Return Address & QR Code */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-1 max-w-[420px]">
                      <div className="text-[9px] font-bold uppercase text-rose-700">
                        If Undelivered Return To:
                      </div>
                      <div className="text-[10px] text-slate-700 leading-tight">
                        {returnAddress} • Helpline: +91 {phone1}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono truncate">
                        Tracking URL: {trackingUrl}
                      </div>
                    </div>

                    <div className="p-1 bg-white border border-slate-300 rounded shrink-0">
                      <div dangerouslySetInnerHTML={{ __html: qrSvgSmall }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-border-default">
          <div className="text-[11px] text-text-muted">
            Format: <strong>{labelSize === "4x6" ? "4x6 Thermal Label (100x150mm)" : "A4 Full Page (210x297mm)"}</strong> • Dynamic Company Profile from Settings
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1.5" /> Print Label / Slip
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
