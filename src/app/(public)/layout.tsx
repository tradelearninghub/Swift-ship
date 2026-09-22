import React from "react";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { getCompanyProfile } from "@/lib/settings";
import { WhatsAppFloatingButton } from "@/components/ui/WhatsAppFloatingButton";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCompanyProfile();
  const phone1 = profile.support_phones[0] || "8000151117";
  const phone2 = profile.support_phones[1] || "7689987368";

  // Normalized WhatsApp link
  const waNumber = (profile.whatsapp || "8000151117").replace(/\D/g, "").replace(/^91/, "");
  const defaultWaLink = `https://wa.me/91${waNumber}?text=${encodeURIComponent(
    `Hello ${profile.company_name || "SS Courier service"}, I would like to inquire about courier services.`
  )}`;
  const whatsappUrl = profile.whatsapp_url?.trim() || (profile.whatsapp?.trim() ? defaultWaLink : undefined);

  // Complete Social Channels (Filtered to configured channels only)
  const socialList = [
    {
      url: profile.facebook_url?.trim(),
      icon: "fab fa-facebook-f",
      hover: "hover:bg-[#1877F2]",
      label: "Facebook",
    },
    {
      url: profile.instagram_url?.trim(),
      icon: "fab fa-instagram",
      hover: "hover:bg-[#E4405F]",
      label: "Instagram",
    },
    {
      url: (profile.x_url || profile.twitter_url)?.trim(),
      isSvg: true,
      hover: "hover:bg-black",
      label: "X (formerly Twitter)",
    },
    {
      url: profile.linkedin_url?.trim(),
      icon: "fab fa-linkedin-in",
      hover: "hover:bg-[#0A66C2]",
      label: "LinkedIn",
    },
    {
      url: profile.youtube_url?.trim(),
      icon: "fab fa-youtube",
      hover: "hover:bg-[#FF0000]",
      label: "YouTube",
    },
    {
      url: whatsappUrl,
      icon: "fab fa-whatsapp",
      hover: "hover:bg-[#25D366]",
      label: "WhatsApp",
    },
  ].filter((s) => Boolean(s.url));

  const otherSocials = socialList.filter((s) => s.label !== "WhatsApp");

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#222]">
      {/* 1. TOP BAR */}
      <div className="top-bar">
        <div className="main-container">
          {/* Left: Contact Info */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-slate-300">
            <span className="info-item flex items-center">
              <i className="fas fa-phone-alt"></i>
              <a href={`tel:+91${phone1.replace(/^\+91/, "").trim()}`} className="hover:text-white transition-colors">
                +91 {phone1.replace(/^\+91/, "").trim()}
              </a>
              <span className="mx-1 text-slate-500">/</span>
              <a href={`tel:+91${phone2.replace(/^\+91/, "").trim()}`} className="hover:text-white transition-colors">
                +91 {phone2.replace(/^\+91/, "").trim()}
              </a>
            </span>
            <span className="info-item hidden md:flex items-center">
              <i className="fas fa-envelope"></i>
              <a href={`mailto:${profile.support_email}`} className="hover:text-white transition-colors">
                {profile.support_email}
              </a>
            </span>
          </div>

          {/* Right: Support, Tracking, Login, WhatsApp & Socials */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <span className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <i className="fas fa-headset text-[#FF6B00]"></i> 24/7 Support
            </span>
            <span className="w-px h-3.5 bg-white/20 hidden lg:inline"></span>
            <Link href="/track" className="text-slate-300 hover:text-[#FF6B00] transition-colors flex items-center gap-1.5">
              <i className="fas fa-search-location text-[#FF6B00]"></i>
              <span>Tracking</span>
            </Link>
            <span className="w-px h-3.5 bg-white/20"></span>
            <Link href="/login" className="text-slate-300 hover:text-[#FF6B00] transition-colors flex items-center gap-1.5 font-medium">
              <i className="fas fa-user-circle text-slate-400"></i>
              <span>Customer Login</span>
            </Link>

            {/* Direct WhatsApp Quick Chat Pill */}
            {whatsappUrl && (
              <>
                <span className="w-px h-3.5 bg-white/20 hidden sm:inline"></span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold shadow-xs transition-all hover:scale-105"
                  title="Chat on WhatsApp"
                >
                  <i className="fab fa-whatsapp text-xs !text-white !mr-0"></i>
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </>
            )}

            {/* Other Social Icons */}
            {otherSocials.length > 0 && (
              <>
                <span className="w-px h-3.5 bg-white/20 hidden sm:inline"></span>
                <div className="hidden sm:flex items-center gap-1.5">
                  {otherSocials.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-6 h-6 rounded-full bg-white/10 ${s.hover} text-white flex items-center justify-center transition-all text-[11px] hover:scale-110`}
                      title={s.label}
                      aria-label={s.label}
                    >
                      {s.isSvg ? (
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      ) : (
                        <i className={`${s.icon} !text-white !mr-0`}></i>
                      )}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="main-container">
          <Link href="/" className="flex items-center gap-3 group text-decoration-none py-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002B49] via-[#003860] to-[#001b2e] flex items-center justify-center text-white shadow-md shadow-[#002B49]/15 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <i className="fas fa-shipping-fast text-[#FF6B00] text-lg !mr-0"></i>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-[#002B49] leading-tight flex items-center gap-1.5">
                SS COURIER
              </span>
              <span className="text-[10px] font-bold text-[#FF6B00] tracking-[0.22em] uppercase leading-none">
                SERVICES PVT. LTD.
              </span>
            </div>
          </Link>

          {/* Desktop Unified Nav Links */}
          <ul className="nav-links">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/services">Services</Link>
            </li>
            <li>
              <Link href="/track">Tracking</Link>
            </li>
            <li>
              <Link href="/calculator">Rate Calculator</Link>
            </li>
            <li>
              <Link href="/how-it-works">How It Works</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#ff8533] hover:from-[#e56000] hover:to-[#ff6b00] text-white font-bold text-sm shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <i className="fas fa-box-open text-xs !mr-0"></i>
                <span>Book a Parcel</span>
              </Link>
            </li>
          </ul>

          {/* Mobile Quick Action & Side Drawer Trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF6B00] text-white font-bold text-xs shadow-sm hover:bg-[#e05e00] transition-colors"
            >
              <i className="fas fa-box-open text-xs !mr-0"></i>
              <span>Book</span>
            </Link>
            <MobileNav
              phones={[phone1, phone2]}
              email={profile.support_email}
              address={`${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}`}
              socials={socialList}
            />
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT (Zero bottom bar margin needed) */}
      <main className="flex-1">{children}</main>

      {/* FOOTER: Four-Column Layout per §7, §52, and Design System */}
      <footer id="contact" className="site-footer bg-[#001b2e] text-[#ccc] pt-14 pb-6 text-sm border-t border-white/10">
        <div className="main-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Section 1 — Company */}
            <div className="footer-col space-y-3">
              <h3 className="text-white text-xl font-bold tracking-tight">
                {profile.company_name}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {profile.tagline || "Your reliable logistics and cargo delivery partner."}
              </p>
              <div className="pt-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Central Hub: </span>
                {profile.address}, {profile.city}, {profile.state} {profile.pincode}
              </div>

              {/* Social Media Links — ONLY render if configured in Admin (§4) */}
              {socialList.length > 0 && (
                <div className="pt-3">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                    Follow Us & Chat
                  </p>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {socialList.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-8 h-8 rounded-full bg-white/10 ${s.hover} text-white flex items-center justify-center transition-all text-xs shadow-sm`}
                        title={s.label}
                        aria-label={s.label}
                      >
                        {s.isSvg ? (
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        ) : (
                          <i className={s.icon}></i>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2 — Quick Links (6 canonical links matching header nav) */}
            <div className="footer-col">
              <h4 className="text-white text-base font-semibold mb-4 border-b border-white/10 pb-2 inline-block">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Track Shipment
                  </Link>
                </li>
                <li>
                  <Link href="/book" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Book a Parcel
                  </Link>
                </li>
              </ul>
            </div>

            {/* Section 3 — Support & Policies */}
            <div className="footer-col">
              <h4 className="text-white text-base font-semibold mb-4 border-b border-white/10 pb-2 inline-block">
                Support & Policies
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping-policy" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-300 hover:text-[#FF6B00] transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Section 4 — Contact Info (from settings) */}
            <div className="footer-col">
              <h4 className="text-white text-base font-semibold mb-4 border-b border-white/10 pb-2 inline-block">
                Contact Info
              </h4>
              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1">
                    Helpline
                  </p>
                  <div className="flex flex-col gap-1">
                    {profile.support_phones.map((phone, idx) => {
                      const cleanPhone = phone.replace(/^\+91/, "").trim();
                      return (
                        <a
                          key={idx}
                          href={`tel:+91${cleanPhone}`}
                          className="hover:text-[#FF6B00] transition-colors flex items-center gap-2"
                        >
                          <i className="fas fa-phone text-[#FF6B00] text-xs"></i>
                          <span>+91 {cleanPhone}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1">
                    Email Support
                  </p>
                  <a
                    href={`mailto:${profile.support_email}`}
                    className="hover:text-[#FF6B00] transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-envelope text-[#FF6B00] text-xs"></i>
                    <span className="break-all">{profile.support_email}</span>
                  </a>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1">
                    Hub Address
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
                    <i className="fas fa-map-marker-alt text-[#FF6B00] text-xs mt-1 shrink-0"></i>
                    <span>
                      {profile.address}, {profile.city}, {profile.state} {profile.pincode}
                    </span>
                  </p>
                </div>

                {/* Direct WhatsApp Support Corner Button in Footer */}
                {whatsappUrl && (
                  <div className="pt-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs transition-all shadow-sm hover:shadow-md hover:scale-102 group"
                      title="Chat on WhatsApp"
                    >
                      <i className="fab fa-whatsapp text-base group-hover:scale-110 transition-transform"></i>
                      <span>WhatsApp Support (+91 {waNumber})</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thin bottom bar: Attribution + Links */}
          <div className="copyright pt-6 border-t border-white/10 text-center text-xs text-slate-400">
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 leading-relaxed">
              <span>
                © {new Date().getFullYear()} {profile.company_name || "SS Courier service"}. All rights reserved.
              </span>
              <span className="hidden sm:inline opacity-40">•</span>
              <span>
                Developed &amp; Managed by{" "}
                <a
                  href="https://decentonline.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-[#FF6B00] font-medium transition-colors underline underline-offset-2"
                >
                  Decent Online
                </a>
              </span>
              <span className="hidden sm:inline opacity-40">•</span>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="opacity-40">•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="opacity-40">•</span>
              <Link href="/shipping-policy" className="hover:text-white transition-colors">
                Shipping Policy
              </Link>
              <span className="opacity-40">•</span>
              <Link href="/admin/login" className="text-[#FF6B00] hover:underline font-semibold">
                Admin Operations
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Corner WhatsApp Support Button */}
      <WhatsAppFloatingButton
        whatsappNumber={profile.whatsapp}
        whatsappUrl={whatsappUrl}
        companyName={profile.company_name}
      />
    </div>
  );
}

