import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs/config'

const nextConfig: NextConfig = {}

export default withSentryConfig(nextConfig, {
  org: 'santos-labs',
  project: 'flatwhite-me',
  ...(process.env.SENTRY_AUTH_TOKEN ? { authToken: process.env.SENTRY_AUTH_TOKEN } : {}),
  widenClientFileUpload: true,
  silent: !process.env.CI,
})
