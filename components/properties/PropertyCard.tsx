"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Bed, Bath, Maximize2, MapPin, Heart } from "lucide-react";

export type PropertyStatus = "For Sale" | "For Rent" | "Sold" | "New";
export type PropertyType = "House" | "Apartment" | "Villa" | "Studio" | "Commercial";

export interface PropertyCardProps {
  slug: string;
  image: string;
  status: PropertyStatus;
  type: PropertyType;
  title: string;
  address: string;
  price: string;
  priceLabel?: string;
  beds: number;
  baths: number;
  sqm: number;
  agentName?: string;
  agentAvatar?: string;
  featured?: boolean;
}

const statusColors: Record<PropertyStatus, string> = {
  "For Sale": "bg-[#171717] text-white",
  "For Rent": "bg-[#78afcf] text-white",
  Sold: "bg-[#6b7280] text-white",
  New: "bg-emerald-600 text-white",
};

export default function PropertyCard({
  slug,
  image,
  status,
  type,
  title,
  address,
  price,
  priceLabel,
  beds,
  baths,
  sqm,
  agentName,
  agentAvatar,
  featured,
}: PropertyCardProps) {
  const t = useTranslations("property");

  return (
    <Link
      href={`/properties/${slug}`}
      className="group block bg-white rounded-xl overflow-hidden border border-[#ebebeb] shadow-[0_2px_16px_0_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* ── Image ── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f8f8f8]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status Badge */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-md ${statusColors[status]}`}
        >
          {status}
        </span>

        {/* Type Badge */}
        <span className="absolute top-3 right-12 px-2.5 py-1 text-xs font-medium text-[#333] bg-white/90 backdrop-blur-sm rounded-md">
          {type}
        </span>

        {/* Wishlist Button */}
        <button
          aria-label="Save property"
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-md text-[#6b7280] hover:text-rose-500 hover:bg-white transition-all"
        >
          <Heart size={15} />
        </button>

        {/* Featured Label */}
        {featured && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 text-xs font-semibold text-white bg-[#78afcf] rounded-md">
            Featured
          </span>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 md:p-5">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-xl font-bold text-[#171717]">{price}</span>
          {priceLabel && (
            <span className="text-xs text-[#6b7280] font-medium">{priceLabel}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#171717] mb-1.5 line-clamp-2 group-hover:text-[#78afcf] transition-colors">
          {title}
        </h3>

        {/* Address */}
        <div className="flex items-center gap-1 mb-4">
          <MapPin size={12} className="text-[#6b7280] flex-shrink-0" />
          <span className="text-xs text-[#6b7280] truncate">{address}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-[#ebebeb] mb-4" />

        {/* Stats Row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Bed size={14} className="text-[#6b7280]" />
            <span className="text-xs font-medium text-[#333]">{beds} {t("bedrooms")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={14} className="text-[#6b7280]" />
            <span className="text-xs font-medium text-[#333]">{baths} {t("bathrooms")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 size={14} className="text-[#6b7280]" />
            <span className="text-xs font-medium text-[#333]">{sqm} {t("sqm")}</span>
          </div>

          {/* Agent (if provided, pushed right) */}
          {agentName && (
            <div className="ml-auto flex items-center gap-1.5">
              {agentAvatar ? (
                <img
                  src={agentAvatar}
                  alt={agentName}
                  className="w-6 h-6 rounded-full object-cover border border-[#ebebeb]"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#78afcf] flex items-center justify-center text-white text-[9px] font-bold">
                  {agentName.charAt(0)}
                </div>
              )}
              <span className="text-xs text-[#6b7280] hidden sm:block truncate max-w-[70px]">
                {agentName}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
