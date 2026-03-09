"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface InquiryFormProps {
  /** If provided, this is a property inquiry. If omitted, it's a general contact. */
  propertySlug?: string;
  locale: string;
  /** Extra CSS classes for the outer wrapper */
  className?: string;
}

export default function InquiryForm({ propertySlug, locale, className }: InquiryFormProps) {
  const t = useTranslations("inquiry");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: propertySlug
      ? "I'm interested in this property and would like to arrange a viewing."
      : "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const body: Record<string, string> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        message: form.message,
        locale,
      };
      if (propertySlug) body.propertySlug = propertySlug;

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error ?? t("error"));
      }
    } catch {
      setStatus("error");
      setErrorMsg(t("error"));
    }
  }

  if (status === "success") {
    return (
      <div className={`flex flex-col items-center justify-center py-10 text-center ${className ?? ""}`}>
        <div className="w-12 h-12 rounded-full bg-[#78afcf]/15 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[#78afcf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#171717] mb-1">{t("success")}</p>
        <p className="text-xs text-[#6b7280]">We'll be in touch shortly.</p>
      </div>
    );
  }

  const inputClass =
    "px-3 py-2.5 text-xs bg-[#f8f8f8] border border-[#ebebeb] rounded-lg outline-none focus:border-[#78afcf] transition-colors placeholder:text-[#6b7280]";

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className ?? ""}`}>
      <div className="grid grid-cols-2 gap-3">
        <input
          name="firstName"
          type="text"
          placeholder={t("first_name")}
          value={form.firstName}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <input
          name="lastName"
          type="text"
          placeholder={t("last_name")}
          value={form.lastName}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>
      <input
        name="email"
        type="email"
        placeholder={t("email")}
        value={form.email}
        onChange={handleChange}
        required
        className={inputClass}
      />
      <input
        name="phone"
        type="tel"
        placeholder={t("phone")}
        value={form.phone}
        onChange={handleChange}
        required
        className={inputClass}
      />
      <textarea
        name="message"
        placeholder={t("message")}
        value={form.message}
        onChange={handleChange}
        rows={4}
        required
        className={`${inputClass} resize-none`}
      />
      {status === "error" && (
        <p className="text-xs text-red-500">{errorMsg || t("error")}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-3 text-sm font-semibold text-white bg-[#78afcf] hover:bg-[#5a96b8] rounded-xl transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : t("submit")}
      </button>
      <p className="text-[10px] text-center text-[#6b7280]">
        By submitting you agree to our{" "}
        <Link href="/privacy" className="text-[#78afcf] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
