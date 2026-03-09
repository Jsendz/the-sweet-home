"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X, Home } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { labelKey: "properties" as const, href: "/properties" as const },
    { labelKey: "rentals" as const, href: "/rentals" as const },
    { labelKey: "commercial" as const, href: "/commercial" as const },
    { labelKey: "agents" as const, href: "/agents" as const },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_16px_0_rgba(0,0,0,0.08)]" : "shadow-[0_1px_0_0_#ebebeb]"
      }`}
    >
      <div className="container-site">
        <nav className="flex items-center justify-between h-16 md:h-[72px]">
          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2 text-[#171717] hover:text-[#78afcf] transition-colors"
          >
            <span className="flex items-center justify-center w-8 h-8 bg-[#171717] rounded-lg">
              <Home size={16} className="text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight">Realest</span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-[#333333] hover:text-[#171717] hover:bg-[#f8f8f8] rounded-lg transition-all duration-150"
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Desktop Right Side ── */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/contact"
              className="px-5 py-2.5 text-sm font-semibold text-[#171717] border border-[#ebebeb] rounded-lg hover:border-[#171717] transition-all duration-150"
            >
              {t("contact")}
            </Link>
            <Link
              href="/properties"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#171717] rounded-lg hover:bg-[#333333] transition-all duration-150"
            >
              List Property
            </Link>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#171717] hover:bg-[#f8f8f8] transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#ebebeb] shadow-[0_8px_24px_0_rgba(0,0,0,0.08)]">
          <div className="container-site py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-[#333333] hover:text-[#171717] hover:bg-[#f8f8f8] rounded-lg transition-all"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-[#ebebeb] flex flex-col gap-2">
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-center text-[#171717] border border-[#ebebeb] rounded-lg hover:border-[#171717] transition-all"
              >
                {t("contact")}
              </Link>
              <Link
                href="/properties"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-center text-white bg-[#171717] rounded-lg hover:bg-[#333333] transition-all"
              >
                List Property
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
