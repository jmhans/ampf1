// Set APP_BASE_URL dynamically from VERCEL_URL for preview/production deployments
if (!process.env.APP_BASE_URL) {
  if (process.env.VERCEL_URL) {
    process.env.APP_BASE_URL = `https://${process.env.VERCEL_URL}`;
  } else {
    process.env.APP_BASE_URL = 'http://localhost:3000';
  }
}

import { auth0 } from "./app/lib/auth0";

export async function proxy(request: Request) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};
