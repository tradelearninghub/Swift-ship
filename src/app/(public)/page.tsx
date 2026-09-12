"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TrackType = "awb" | "order" | "mobile";

export default function HomePage() {
  const router = useRouter();
  const [trackType, setTrackType] = useState<TrackType>("awb");
  const [searchValue, setSearchValue] = useState("");
  const [mobileValue, setMobileValue] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackType === "awb") {
      const q = searchValue.trim();
      if (!q) return;
      router.push(`/track?awb=${encodeURIComponent(q)}`);
    } else if (trackType === "order") {
      const q = searchValue.trim();
      if (!q) return;
      router.push(`/track?order_id=${encodeURIComponent(q)}`);
    } else {
      const m = mobileValue.trim();
      if (!m) return;
      router.push(`/track?mobile=${encodeURIComponent(m)}`);
    }
  };

  return (
    <div>
      {/* ========================================================================= */}
      {/* 2. HERO SECTION + 3-OPTION TRACKING (Exact ai_studio_code (14).html) */}
      {/* ========================================================================= */}
      <section className="hero" id="track">
        <div className="main-container">
          <h1>Fast, Safe & Reliable Courier Services</h1>
          <p>Track your package live anywhere across India and abroad</p>

          <div className="tracking-wrapper">
            {/* 3 Options Tabs */}
            <div className="track-tabs">
              <button
                type="button"
                className={`track-tab-btn ${trackType === "awb" ? "active" : ""}`}
                onClick={() => {
                  setTrackType("awb");
                  setSearchValue("");
                }}
              >
                <i className="fas fa-barcode"></i> AWB No.
              </button>
              <button
                type="button"
                className={`track-tab-btn ${trackType === "order" ? "active" : ""}`}
                onClick={() => {
                  setTrackType("order");
                  setSearchValue("");
                }}
              >
                <i className="fas fa-receipt"></i> Order ID
              </button>
              <button
                type="button"
                className={`track-tab-btn ${trackType === "mobile" ? "active" : ""}`}
                onClick={() => {
                  setTrackType("mobile");
                  setMobileValue("");
                }}
              >
                <i className="fas fa-mobile-alt"></i> Mobile No.
              </button>
            </div>

            {/* Input Form Box */}
            <form className="track-box" onSubmit={handleTrackSubmit}>
              {trackType === "mobile" ? (
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileValue}
                  onChange={(e) => setMobileValue(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter Registered 10-digit Mobile Number"
                  required
                />
              ) : (
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    trackType === "awb"
                      ? "Enter AWB / Consignment Number (e.g. DEL98234123)"
                      : "Enter Order / Reference ID (e.g. BK-1025)"
                  }
                  required
                />
              )}
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-search-location" style={{ marginRight: "6px" }}></i> Track Parcel
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. QUICK FEATURES (Exact ai_studio_code (14).html) */}
      {/* ========================================================================= */}
      <section className="quick-features">
        <div className="main-container">
          <div className="quick-grid">
            <Link href="/calculator" className="quick-card">
              <i className="fas fa-calculator"></i>
              <h3>Rate Calculator</h3>
              <p>Calculate shipping cost instantly by weight & distance.</p>
            </Link>
            <Link href="/book" className="quick-card">
              <i className="fas fa-truck-pickup"></i>
              <h3>Schedule Pickup</h3>
              <p>Get doorstep parcel pickup from your home or warehouse.</p>
            </Link>
            <Link href="/contact" className="quick-card">
              <i className="fas fa-map-marker-alt"></i>
              <h3>Locate Hub</h3>
              <p>Find the nearest delivery hub and service branches.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SERVICES SECTION (Exact ai_studio_code (14).html) */}
      {/* ========================================================================= */}
      <section className="services" id="services">
        <div className="main-container">
          <div className="section-title">
            <h2>Our Shipping Services</h2>
            <p>Tailored logistics solutions for individuals and enterprises.</p>
          </div>
          <div className="service-grid">
            <div className="service-item">
              <div className="service-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=500&q=60"
                  alt="Domestic Courier"
                />
              </div>
              <div className="service-content">
                <h3>Domestic Delivery</h3>
                <p>Fast delivery across all pincodes with cash on delivery (COD).</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1524522173746-f628baad3644?auto=format&fit=crop&w=500&q=60"
                  alt="International Shipping"
                />
              </div>
              <div className="service-content">
                <h3>International Cargo</h3>
                <p>Worldwide parcel delivery with complete customs clearance support.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=500&q=60"
                  alt="Same Day Delivery"
                />
              </div>
              <div className="service-content">
                <h3>Same Day / Express</h3>
                <p>Urgent documents and high-priority parcels delivered within hours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS (Exact ai_studio_code (14).html) */}
      {/* ========================================================================= */}
      <section className="process">
        <div className="main-container">
          <div className="section-title">
            <h2>How It Works</h2>
            <p>Track, ship and receive in 4 easy steps</p>
          </div>
          <div className="process-grid">
            <div className="process-step">
              <div className="step-icon">
                <i className="fas fa-file-signature"></i>
              </div>
              <h4>1. Book</h4>
              <p>Enter parcel details.</p>
            </div>
            <div className="process-step">
              <div className="step-icon">
                <i className="fas fa-box-open"></i>
              </div>
              <h4>2. Pickup</h4>
              <p>We pick up from doorstep.</p>
            </div>
            <div className="process-step">
              <div className="step-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <h4>3. In Transit</h4>
              <p>Real-time live GPS tracking.</p>
            </div>
            <div className="process-step">
              <div className="step-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h4>4. Delivery</h4>
              <p>Safe delivery with OTP verify.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STATS (Exact ai_studio_code (14).html) */}
      {/* ========================================================================= */}
      <section className="stats">
        <div className="main-container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>5M+</h3>
              <p>Deliveries Done</p>
            </div>
            <div className="stat-item">
              <h3>27,000+</h3>
              <p>Pincodes Active</p>
            </div>
            <div className="stat-item">
              <h3>99.8%</h3>
              <p>On-Time Delivery</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Live Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <section style={{ padding: "60px 0" }}>
        <div className="main-container">
          <div
            style={{
              background: "linear-gradient(to right, #002B49, #003e6b)",
              color: "#fff",
              borderRadius: "12px",
              padding: "40px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ maxWidth: "600px" }}>
              <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
                Ready to dispatch your parcel?
              </h2>
              <p style={{ color: "#ddd", fontSize: "15px" }}>
                Book online in under 2 minutes. Transparent rates, multi-carrier network, and 24/7 shipment tracking.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/book" className="btn btn-primary" style={{ padding: "14px 30px", fontSize: "15px" }}>
                Book a Parcel Now
              </Link>
              <Link
                href="/contact"
                className="btn"
                style={{
                  border: "1px solid rgba(255,255,255,0.8)",
                  color: "#fff",
                  padding: "14px 30px",
                  fontSize: "15px",
                }}
              >
                Contact Jaipur Hub
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
