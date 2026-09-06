"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MockBooking } from "@/lib/mockData";
import { formatPaiseToRupees, formatGramsToKg } from "@/lib/utils";
import { Printer, QrCode, Truck, ShieldCheck, Download } from "lucide-react";

interface ReceiptLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: MockBooking;
}

export function ReceiptLabelModal({
  isOpen,
  onClose,
  booking,
}: ReceiptLabelModalProps) {
  const parcel = booking.parcels[0];
  const weightGrams =
    parcel?.verified_weight_grams ?? parcel?.submitted_weight_grams ?? 0;
  const lengthCm =
    parcel?.verified_length_cm ?? parcel?.submitted_length_cm ?? 0;
  const widthCm = parcel?.verified_width_cm ?? parcel?.submitted_width_cm ?? 0;
  const heightCm =
    parcel?.verified_height_cm ?? parcel?.submitted_height_cm ?? 0;

  const awb = booking.shipment?.awb || "PENDING-GENERATION";
  const courier = booking.shipment?.courier_name || "Assigned Partner";
  const token = booking.shipment?.tracking_token || `tok_${booking.booking_number.toLowerCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shipping Label & Dispatch Receipt"
      description={`Printable standard logistics label for booking #${booking.booking_number}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Printable Thermal Label Canvas */}
        <div
          id="printable-label"
          className="bg-white border-2 border-slate-900 rounded-lg p-6 text-slate-900 font-sans shadow-sm space-y-4 text-xs"
        >
          {/* Top Label Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm uppercase tracking-wider">
                  Swift Ship Express
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                  Multi-Courier Logistics Platform
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase text-slate-500">
                Courier Partner
              </div>
              <div className="text-sm font-black text-blue-900 uppercase">
                {courier}
              </div>
            </div>
          </div>

          {/* Barcode & AWB Display */}
          <div className="p-3 bg-slate-50 border border-slate-300 rounded text-center space-y-1">
            <div className="font-mono text-[9px] text-slate-400 tracking-[0.25em]">
              ||||| | |||||||| | ||| |||||| | ||||||| |||| | |||||||| ||||
            </div>
            <div className="font-mono text-base font-bold tracking-widest text-slate-900">
              AWB: {awb}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Booking Ref: {booking.booking_number}
            </div>
          </div>

          {/* Sender & Receiver Split */}
          <div className="grid grid-cols-2 gap-4 border-y border-slate-300 py-3">
            {/* Sender / From */}
            <div className="space-y-1 pr-2 border-r border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                FROM (SHIPPER):
              </div>
              <div className="font-bold text-slate-900">{booking.sender_name}</div>
              <div className="text-slate-600 leading-snug">
                {booking.sender_address}
              </div>
              <div className="font-semibold text-slate-800">
                {booking.sender_city}, {booking.sender_state} - {booking.sender_pincode}
              </div>
              <div className="font-mono text-[11px] text-slate-700">
                Ph: {booking.sender_mobile}
              </div>
            </div>

            {/* Receiver / Deliver To */}
            <div className="space-y-1 pl-2">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                SHIP TO (DELIVER TO):
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {booking.receiver_name}
              </div>
              <div className="text-slate-600 leading-snug">
                {booking.receiver_address}
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {booking.receiver_city}, {booking.receiver_state} -{" "}
                <span className="bg-yellow-200 px-1 py-0.5 rounded font-black">
                  {booking.receiver_pincode}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-700">
                Ph: {booking.receiver_mobile}
              </div>
            </div>
          </div>

          {/* Parcel Metrics & Payment Details */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold">Weight & Size:</div>
              <div className="font-mono font-bold text-slate-800">
                {formatGramsToKg(weightGrams)}
              </div>
              <div className="font-mono text-[10px] text-slate-600">
                {lengthCm}x{widthCm}x{heightCm} cm
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold">Payment Type:</div>
              <div className="font-bold text-slate-900">
                {booking.payment_type}
              </div>
              {booking.payment_type === "COD" && (
                <div className="text-emerald-700 font-bold font-mono text-xs">
                  COD: {formatPaiseToRupees(booking.cod_amount)}
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-semibold">Shipping Charge:</div>
              <div className="font-mono font-bold text-slate-900">
                {booking.charges ? formatPaiseToRupees(booking.charges.total) : "Verified in review"}
              </div>
              <div className="text-[10px] text-slate-500">
                Decl: {formatPaiseToRupees(parcel?.declared_value || 0)}
              </div>
            </div>
          </div>

          {/* Footer QR Tracking Code */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-300">
            <div className="space-y-0.5 max-w-[340px]">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Scan QR for Live Tracking
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Scan with phone camera to view live status updates, delivery OTP, and verified transit logs.
              </p>
              <div className="font-mono text-[9px] text-slate-400">
                https://swiftship.com/track/{token}
              </div>
            </div>

            <div className="p-2 bg-white border border-slate-300 rounded-md flex flex-col items-center">
              <QrCode className="w-14 h-14 text-slate-900" />
              <span className="text-[8px] font-mono text-slate-500 mt-0.5">SECURE-TOKEN</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" /> Print Label
          </Button>
        </div>
      </div>
    </Modal>
  );
}
