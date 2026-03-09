// Root layout — intentionally minimal.
// The locale layout (app/[locale]/layout.tsx) handles <html>, <body>,
// fonts, and NextIntlClientProvider.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
