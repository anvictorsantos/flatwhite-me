// `??` lets a blank env var through; `new URL('')` then breaks the build.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://flatwhite.me'

// Render rewrites Host to the internal address, so request.url resolves to localhost:10000.
export function publicOrigin(request: Request): string {
  return process.env.RENDER_EXTERNAL_URL?.trim() || new URL(request.url).origin
}
