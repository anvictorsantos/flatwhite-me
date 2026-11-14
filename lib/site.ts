// `??` lets a blank env var through; `new URL('')` then breaks the build.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://flatwhite.me'
