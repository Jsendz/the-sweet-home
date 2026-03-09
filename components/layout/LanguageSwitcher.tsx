"use client";

import { useLocale } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";

const locales = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "es", label: "ES" },
  { code: "ca", label: "CA" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5">
      {locales.map(({ code, label }, i) => (
        <span key={code} className="flex items-center">
          <Link
            href={pathname}
            locale={code}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
              locale === code
                ? "bg-[#171717] text-white"
                : "text-[#6b7280] hover:text-[#171717] hover:bg-[#f8f8f8]"
            }`}
          >
            {label}
          </Link>
          {i < locales.length - 1 && (
            <span className="w-px h-3 bg-[#ebebeb] mx-0.5" />
          )}
        </span>
      ))}
    </div>
  );
}
