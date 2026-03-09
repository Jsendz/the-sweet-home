import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MapPin, Phone, Mail } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: `${t("title")} | Sweet Estate` };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("contact");

  return (
    <div className="pt-16 md:pt-[72px] min-h-screen bg-white">
      <div className="bg-[#f8f8f8] border-b border-[#ebebeb]">
        <div className="container-site py-10 md:py-14 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#171717] mb-2">{t("title")}</h1>
          <p className="text-[#6b7280] text-sm md:text-base max-w-md mx-auto">{t("subtitle")}</p>
        </div>
      </div>

      <div className="container-site py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Info */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-[#f8f8f8] border border-[#ebebeb] rounded-xl flex-shrink-0">
                  <MapPin size={16} className="text-[#78afcf]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
                    {t("address")}
                  </div>
                  <div className="text-sm text-[#171717]">
                    12 Rue de la Paix<br />75001 Paris, France
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-[#f8f8f8] border border-[#ebebeb] rounded-xl flex-shrink-0">
                  <Phone size={16} className="text-[#78afcf]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
                    {t("phone")}
                  </div>
                  <a
                    href="tel:+33140000000"
                    className="text-sm text-[#171717] hover:text-[#78afcf] transition-colors"
                  >
                    +33 1 40 00 00 00
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-[#f8f8f8] border border-[#ebebeb] rounded-xl flex-shrink-0">
                  <Mail size={16} className="text-[#78afcf]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
                    {t("email")}
                  </div>
                  <a
                    href="mailto:hello@sweetestate.eu"
                    className="text-sm text-[#171717] hover:text-[#78afcf] transition-colors"
                  >
                    hello@sweetestate.eu
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form — client component handles POST to /api/inquiries */}
          <div className="flex-1 max-w-xl">
            <InquiryForm
              locale={locale}
              className="[&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-sm [&_button[type=submit]]:py-3.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
