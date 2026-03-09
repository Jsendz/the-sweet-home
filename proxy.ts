import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// Exclude: /api/*, /_next/*, /_vercel/*, /*/studio/*, and static files (e.g. /favicon.ico)
export const config = {
  matcher: ["/((?!api|_next|_vercel|[^/]+/studio|.*\\..*).*)" ],
};
