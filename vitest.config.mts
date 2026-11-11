import { defineConfig } from 'vitest/config'

const root = new URL('.', import.meta.url).pathname

export default defineConfig({
  resolve: {
    alias: { '@': root },
  },
})
