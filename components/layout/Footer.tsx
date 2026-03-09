"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Home, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Team", href: "/agents" },
    { label: "Careers", href: "/careers" },
    { label: "Press & Media", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
  Properties: [
    { label: "For Sale", href: "/properties?type=sale" },
    { label: "For Rent", href: "/rentals" },
    { label: "New Developments", href: "/properties?type=new" },
    { label: "Luxury Homes", href: "/properties?type=luxury" },
    { label: "Commercial", href: "/commercial" },
  ],
  Services: [
    { label: "Property Valuation", href: "/services/valuation" },
    { label: "Mortgage Calculator", href: "/services/mortgage" },
    { label: "Property Management", href: "/services/management" },
    { label: "Investment Advice", href: "/services/investment" },
    { label: "Legal Support", href: "/services/legal" },
  ],
  Resources: [
    { label: "Blog & News", href: "/blog" },
    { label: "Market Reports", href: "/reports" },
    { label: "Buying Guide", href: "/guides/buying" },
    { label: "Renting Guide", href: "/guides/renting" },
    { label: "FAQs", href: "/faq" },
  ],
} as const;

const socialLinks = [
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Twitter, href: "#", label: "Twitter" },
  { Icon: Linkedin, href: "#", label: "LinkedIn" },
  { Icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="bg-[#171717] text-white">
      {/* ── Top CTA Banner ── */}
      <div className="border-b border-white/10">
        <div className="container-site py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Ready to find your dream home?
            </h2>
            <p className="text-white/60 text-sm md:text-base">
              Browse thousands of properties and connect with expert agents today.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/properties"
              className="px-6 py-3 text-sm font-semibold text-[#171717] bg-white rounded-lg hover:bg-[#f8f8f8] transition-colors"
            >
              {tNav("properties")}
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 text-sm font-semibold text-white border border-white/30 rounded-lg hover:border-white/60 transition-colors"
            >
              {tNav("contact")}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="container-site py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                <Home size={16} className="text-[#171717]" />
              </span>
              <span className="text-lg font-bold tracking-tight">Realest</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-xs">
              {t("tagline")}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/15 text-white/50 hover:text-white hover:border-white/40 transition-all"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                {section}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/10">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Realest. {t("copyright")}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-white/35 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-white/35 hover:text-white/60 transition-colors">
              Terms of Use
            </Link>
            <Link href="/cookies" className="text-xs text-white/35 hover:text-white/60 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
