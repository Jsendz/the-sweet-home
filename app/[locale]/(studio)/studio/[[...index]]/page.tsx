/**
 * Embedded Sanity Studio — accessible at /{locale}/studio
 *
 * Required packages (add before use):
 *   npm install sanity next-sanity @sanity/client
 *
 * This page sits in the (studio) route group so it inherits the bare
 * [locale]/layout.tsx (html/body + fonts) but NOT the (public) layout
 * (Navbar + Footer), giving the Studio full viewport height.
 */

// Force dynamic rendering — Studio is never statically generated
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Re-export viewport and metadata from next-sanity so the Studio
// sets its own <meta viewport> and <title> correctly.
export { viewport, metadata } from 'next-sanity/studio'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
