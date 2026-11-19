import type { NextConfig } from "next";

/**
 * Security headers (QA SEC-01/02). The CSP is deliberately narrow: it blocks framing, plugins,
 * <base> hijacking and off-site form posts without restricting scripts or styles, so KaTeX and
 * Next's inline bootstrap keep working.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  // Standalone output for the Cloud Run container; Vercel builds ignore this variable.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
