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
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden w-full">
      {/* TOPBAR (Matches Image 3 mockup: Dark Navy #06122C) */}
      <div className="bg-[#06122C] text-slate-300 text-xs py-2 border-b border-slate-800/80 select-none w-full">
        <div className="main-container flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Global Reach (lg+), Support Email (sm+), Phone (all viewports) */}
          <div className="flex items-center gap-x-2 sm:gap-x-4 shrink-0 text-slate-300 min-w-0">
            <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-300 font-medium shrink-0">
              <i className="fas fa-map-marker-alt text-[#C58B24] text-[11px]"></i>
              <span>Global Reach, Local Support</span>
            </span>
            <span className="hidden lg:inline text-slate-700">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0">
              <i className="fas fa-envelope text-[#C58B24] text-[11px]"></i>
              <a href={`mailto:${profile.support_email}`} className="hover:text-white transition-colors">
                {profile.support_email}
              </a>
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="flex items-center gap-1.5 shrink-0 font-medium">
              <i className="fas fa-phone-alt text-[#C58B24] text-[11px]"></i>
              <a href={`tel:+91${phone1.replace(/^\+91/, "").trim()}`} className="hover:text-white transition-colors whitespace-nowrap">
                +91 {phone1.replace(/^\+91/, "").trim()}
              </a>
            </span>
          </div>

          {/* Right: Social Channels | Language / Tracking */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Social Icons: Perfectly visible on all mobile and desktop viewports */}
            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href={profile.facebook_url || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <i className="fab fa-facebook-f text-xs"></i>
              </a>
              <a
                href={profile.instagram_url || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <i className="fab fa-instagram text-xs"></i>
              </a>
              <a
                href={profile.linkedin_url || "https://linkedin.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <i className="fab fa-linkedin-in text-xs"></i>
              </a>
              <a
                href={profile.youtube_url || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="YouTube"
              >
                <i className="fab fa-youtube text-xs"></i>
              </a>
            </div>

            <span className="w-px h-3.5 bg-slate-700 hidden sm:inline"></span>

            {/* Language Selector */}
            <div className="hidden sm:flex items-center gap-1 text-slate-300 font-medium text-xs cursor-pointer hover:text-white transition-colors">
              <i className="fas fa-globe text-xs"></i>
              <span>English</span>
              <i className="fas fa-chevron-down text-[9px] opacity-70"></i>
            </div>

            <span className="w-px h-3.5 bg-slate-700 hidden md:inline"></span>

            <Link href="/login" className="hidden md:inline-flex text-slate-300 hover:text-white transition-colors items-center gap-1 font-medium">
              <i className="fas fa-user-circle text-xs text-[#C58B24]"></i>
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>


      {/* NAVBAR (Crisp white header with official SS International Courier logo & gold Book Now CTA) */}
      <nav className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-xs py-2 sm:py-3">
        <div className="main-container flex items-center justify-between gap-4">
          {/* Official Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group text-decoration-none py-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/header-logo.jpg"
              alt="SS International Courier"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
            />
          </Link>

          {/* Desktop Unified Nav Links matching Image 3 */}
          <ul className="hidden lg:flex items-center gap-6 xl:gap-8 list-none m-0 p-0">
            <li>
              <Link href="/" className="text-[#06122C] font-bold text-sm hover:text-[#C58B24] transition-colors border-b-2 border-[#C58B24] pb-1">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-slate-700 hover:text-[#C58B24] font-medium text-sm transition-colors pb-1">
                About Us
              </Link>
            </li>
            <li className="relative group">
              <Link href="/services" className="text-slate-700 hover:text-[#C58B24] font-medium text-sm transition-colors flex items-center gap-1 pb-1">
                <span>Services</span>
                <i className="fas fa-chevron-down text-[10px] text-slate-400 group-hover:text-[#C58B24] transition-colors"></i>
              </Link>
            </li>
            <li>
              <Link href="/track" className="text-slate-700 hover:text-[#C58B24] font-medium text-sm transition-colors pb-1">
                Track Your Shipment
              </Link>
            </li>
            <li>
              <Link href="/calculator" className="text-slate-700 hover:text-[#C58B24] font-medium text-sm transition-colors pb-1">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-slate-700 hover:text-[#C58B24] font-medium text-sm transition-colors pb-1">
                Contact Us
              </Link>
            </li>
          </ul>

          {/* Right Action: Gold Book Now Button + Search Icon */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C58B24] hover:bg-[#b07b1d] text-white font-bold text-sm shadow-md shadow-[#C58B24]/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <i className="fas fa-box-open text-xs !mr-0"></i>
              <span>Book Now</span>
            </Link>
            <Link
              href="/track"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-xs"
              title="Track Consignment Search"
            >
              <i className="fas fa-search text-xs"></i>
            </Link>
          </div>

          {/* Mobile Quick Action & Side Drawer Trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C58B24] text-white font-bold text-xs shadow-xs hover:bg-[#b07b1d] transition-colors"
            >
              <i className="fas fa-box-open text-xs !mr-0"></i>
              <span>Book Now</span>
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

      {/* FOOTER (Matching reference: Deep Blue #012351 with Gold Angled Accent) */}
      <footer className="bg-[#012351] text-slate-300 pt-14 pb-0 border-t border-blue-900/40">
        <div className="main-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Column 1: Brand Logo & Mission */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/footer-logo-transparent.png"
                  alt="SS International Courier"
                  className="h-14 sm:h-16 w-auto object-contain block"
                />
              </Link>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                SS International Courier provides reliable, fast and secure shipping services worldwide. Bringing people, businesses and opportunities closer together.
              </p>
              {/* Circular Social Icons */}
              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href={profile.facebook_url || "https://facebook.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-colors text-xs"
                  title="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href={profile.instagram_url || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E4405F] text-white flex items-center justify-center transition-colors text-xs"
                  title="Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href={profile.linkedin_url || "https://linkedin.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#0A66C2] text-white flex items-center justify-center transition-colors text-xs"
                  title="LinkedIn"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a
                  href={profile.youtube_url || "https://youtube.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FF0000] text-white flex items-center justify-center transition-colors text-xs"
                  title="YouTube"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-white text-base font-bold mb-4 flex items-center gap-2">
                <span>Quick Links</span>
              </h4>
              <ul className="space-y-2.5 text-sm list-none p-0 m-0">
                <li>
                  <Link href="/" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>Our Services</span>
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>Track Your Shipment</span>
                  </Link>
                </li>
                <li>
                  <Link href="/calculator" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>Pricing</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Our Services */}
            <div>
              <h4 className="text-white text-base font-bold mb-4 flex items-center gap-2">
                <span>Our Services</span>
              </h4>
              <ul className="space-y-2.5 text-sm list-none p-0 m-0">
                <li>
                  <Link href="/services" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>Worldwide Delivery</span>
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>Air Freight</span>
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>Sea Freight</span>
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>Land Courier</span>
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>Custom Clearance</span>
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-slate-300 hover:text-[#C58B24] transition-colors flex items-center gap-2">
                    <span className="text-[#C58B24] text-xs font-bold">&gt;</span>
                    <span>E-Commerce Solutions</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div>
              <h4 className="text-white text-base font-bold mb-4 flex items-center gap-2">
                <span>Contact Us</span>
              </h4>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <i className="fas fa-map-marker-alt text-[#C58B24] mt-1 shrink-0"></i>
                  <span>{profile.address}, {profile.city}, {profile.state} {profile.pincode}</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-phone-alt text-[#C58B24] shrink-0"></i>
                  <a href={`tel:+91${phone1.replace(/^\+91/, "").trim()}`} className="hover:text-white transition-colors">
                    +91 {phone1.replace(/^\+91/, "").trim()}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-envelope text-[#C58B24] shrink-0"></i>
                  <a href={`mailto:${profile.support_email}`} className="hover:text-white transition-colors break-all">
                    {profile.support_email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-clock text-[#C58B24] shrink-0"></i>
                  <span>Mon - Sat : 9:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with Gold Angled Banner */}
        <div className="border-t border-blue-900/50 bg-[#001F4B]">
          <div className="main-container flex flex-col md:flex-row items-center justify-between py-3 gap-3">
            <p className="text-xs text-slate-300 m-0">
              © 2025 {profile.company_name || "SS International Courier"}. All Rights Reserved.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-300">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-500">|</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms &amp; Conditions
              </Link>
              <span className="text-slate-500">|</span>
              <Link href="/shipping-policy" className="hover:text-white transition-colors">
                Disclaimer
              </Link>
            </div>

            {/* Gold Angled Accent Badge */}
            <div
              className="bg-[#C58B24] text-slate-950 font-black italic tracking-wide text-xs px-6 py-2 shadow-md hidden sm:block"
              style={{ clipPath: "polygon(16px 0, 100% 0, 100% 100%, 0 100%)" }}
            >
              Fast. Secure. Global.
            </div>
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
