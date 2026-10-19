import React from "react";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { getCompanyProfile } from "@/lib/settings";
import { WhatsAppFloatingButton } from "@/components/ui/WhatsAppFloatingButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    `Hello ${profile.company_name || "SS International Courier"}, I would like to inquire about courier services.`
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
  ];

  const activeSocials = socialList.filter((s) => Boolean(s.url));
  const otherSocials = activeSocials.filter((s) => s.label !== "WhatsApp");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* TOPBAR (Sleek single-line dark contact & action bar) */}
      <div className="bg-[#070D1B] text-slate-300 text-xs py-2.5 border-b border-slate-800/80 overflow-hidden select-none">
        <div className="main-container flex items-center justify-between gap-4 whitespace-nowrap">
          {/* Left: Phone & Support Email */}
          <div className="flex items-center gap-x-3 sm:gap-x-4 shrink-0">
            <span className="flex items-center gap-1.5 text-slate-300">
              <i className="fas fa-phone-alt text-[#2563EB] text-[11px]"></i>
              <a href={`tel:+91${phone1.replace(/^\+91/, "").trim()}`} className="hover:text-white transition-colors">
                +91 {phone1.replace(/^\+91/, "").trim()}
              </a>
              <span className="text-slate-600">/</span>
              <a href={`tel:+91${phone2.replace(/^\+91/, "").trim()}`} className="hover:text-white transition-colors">
                +91 {phone2.replace(/^\+91/, "").trim()}
              </a>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300 border-l border-slate-800 pl-3">
              <i className="fas fa-envelope text-[#2563EB] text-[11px]"></i>
              <a href={`mailto:${profile.support_email}`} className="hover:text-white transition-colors">
                {profile.support_email}
              </a>
            </span>
          </div>

          {/* Right: Tracking, Login & Socials */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 pr-1">
            <Link href="/track" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <i className="fas fa-search-location text-[#2563EB]"></i>
              <span className="hidden xs:inline">Live Tracking</span>
            </Link>
            <span className="w-px h-3.5 bg-slate-700 hidden sm:inline"></span>
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 font-medium">
              <i className="fas fa-user-circle text-slate-400"></i>
              <span className="hidden xs:inline">Login</span>
            </Link>

            {/* Direct WhatsApp Quick Chat Pill */}
            {whatsappUrl && (
              <>
                <span className="w-px h-3.5 bg-slate-700 hidden sm:inline"></span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold shadow-xs transition-colors"
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
                <span className="w-px h-3.5 bg-slate-700 hidden sm:inline"></span>
                <div className="hidden sm:flex items-center gap-1.5">
                  {otherSocials.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-6 h-6 rounded-full bg-slate-800 ${s.hover} text-white flex items-center justify-center transition-colors text-[11px]`}
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


      {/* NAVBAR (Crisp white header with dark text and sapphire CTA) */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 shadow-xs py-3">
        <div className="main-container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group text-decoration-none py-1">
            <div className="w-10 h-10 rounded-xl bg-[#0B1536] border border-slate-800 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
              <i className="fas fa-shipping-fast text-[#2563EB] text-lg !mr-0"></i>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-[#0F172A] leading-tight flex items-center gap-1.5">
                SS INTERNATIONAL
              </span>
              <span className="text-[10px] font-bold text-[#2563EB] tracking-[0.25em] uppercase leading-none">
                COURIER
              </span>
            </div>
          </Link>

          {/* Desktop Unified Nav Links */}
          <ul className="hidden lg:flex items-center gap-7 list-none m-0 p-0">
            <li>
              <Link href="/" className="text-slate-700 hover:text-[#2563EB] font-semibold text-sm transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/services" className="text-slate-700 hover:text-[#2563EB] font-semibold text-sm transition-colors">
                Services
              </Link>
            </li>
            <li>
              <Link href="/track" className="text-slate-700 hover:text-[#2563EB] font-semibold text-sm transition-colors">
                Tracking
              </Link>
            </li>
            <li>
              <Link href="/calculator" className="text-slate-700 hover:text-[#2563EB] font-semibold text-sm transition-colors">
                Rate Calculator
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="text-slate-700 hover:text-[#2563EB] font-semibold text-sm transition-colors">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-slate-700 hover:text-[#2563EB] font-semibold text-sm transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-slate-700 hover:text-[#2563EB] font-semibold text-sm transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2563EB] text-white font-bold text-xs shadow-sm hover:bg-[#1d4ed8] transition-colors"
            >
              <i className="fas fa-box-open text-xs !mr-0"></i>
              <span>Book</span>
            </Link>
            <MobileNav
              phones={[phone1, phone2]}
              email={profile.support_email}
              address={`${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}`}
              socials={activeSocials}
              whatsappUrl={whatsappUrl}
            />
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-white">{children}</main>

      {/* FOOTER (Deep Luxury Midnight #070D1B) */}
      <footer className="bg-[#070D1B] text-slate-400 pt-16 pb-8 border-t border-slate-800">
        <div className="main-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Section 1 — Brand Story & Identity */}
            <div className="footer-col space-y-4">
              <Link href="/" className="inline-flex items-center gap-3 group text-decoration-none">
                <div className="w-11 h-11 rounded-xl bg-[#0B1536] border border-blue-500/30 flex items-center justify-center text-white shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <i className="fas fa-shipping-fast text-[#2563EB] text-xl !mr-0"></i>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xl text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                    SS INTERNATIONAL
                  </span>
                  <span className="text-[10px] font-bold text-[#2563EB] tracking-[0.25em] uppercase leading-none">
                    COURIER
                  </span>
                </div>
              </Link>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Fast, reliable express courier and automated shipment tracking across 220+ countries. Direct counter booking, commercial invoices, and end-to-end priority logistics.
              </p>

              {/* Social Channels in Brand Column */}
              {activeSocials.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Follow Us
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {activeSocials.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-8 h-8 rounded-full bg-white/10 ${s.hover} text-white flex items-center justify-center transition-all text-xs hover:scale-110 shadow-xs`}
                        title={s.label}
                        aria-label={s.label}
                      >
                        {s.isSvg ? (
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        ) : (
                          <i className={`${s.icon} !text-white !mr-0`}></i>
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
                  <Link href="/" className="text-slate-300 hover:text-[#2563EB] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-300 hover:text-[#2563EB] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-slate-300 hover:text-[#2563EB] transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-slate-300 hover:text-[#2563EB] transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="text-slate-300 hover:text-[#2563EB] transition-colors">
                    Track Shipment
                  </Link>
                </li>
                <li>
                  <Link href="/book" className="text-slate-300 hover:text-[#2563EB] transition-colors">
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
                  <Link href="/contact" className="text-slate-300 hover:text-[#2563EB] transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping-policy" className="text-slate-300 hover:text-[#2563EB] transition-colors">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-slate-300 hover:text-[#2563EB] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-300 hover:text-[#2563EB] transition-colors">
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
                          className="hover:text-[#2563EB] transition-colors flex items-center gap-2"
                        >
                          <i className="fas fa-phone text-[#2563EB] text-xs"></i>
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
                    className="hover:text-[#2563EB] transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-envelope text-[#2563EB] text-xs"></i>
                    <span className="break-all">{profile.support_email}</span>
                  </a>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1">
                    Hub Address
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-white transition-colors leading-relaxed flex items-start gap-2 group"
                    title="Open hub location in Google Maps"
                  >
                    <i className="fas fa-map-marker-alt text-[#2563EB] group-hover:text-blue-400 text-xs mt-1 shrink-0"></i>
                    <span className="group-hover:underline">
                      {profile.address}, {profile.city}, {profile.state} {profile.pincode}
                    </span>
                  </a>
                </div>

              </div>
            </div>
          </div>

          {/* Thin bottom bar: Attribution only (Duplicate policy links removed) */}
          <div className="copyright pt-6 border-t border-white/10 text-center text-xs text-slate-400">
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 leading-relaxed">
              <span>
                © {new Date().getFullYear()} {profile.company_name || "SS International Courier"}. All rights reserved.
              </span>
              <span className="hidden sm:inline opacity-40">•</span>
              <span>
                Developed &amp; Managed by{" "}
                <a
                  href="https://decentonline.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-[#2563EB] font-medium transition-colors underline underline-offset-2"
                >
                  Decent Online
                </a>
              </span>
              <span className="opacity-40">•</span>
              <Link href="/admin/login" className="text-[#2563EB] hover:underline font-semibold">
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
