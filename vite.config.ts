/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { season } from './src/data/season'

const siteUrl = "https://pablitoessasito.github.io/wt-battlepass-helper/"

// Fills the {{...}} placeholders in index.html, so the title and description
// search engines show follow season.ts instead of going stale every season.
function htmlPlaceholders(values: Record<string, string>): Plugin {
  return {
    name: "html-placeholders",
    transformIndexHtml(html) {
      return html.replace(/\{\{(\w+)\}\}/g, (placeholder, key: string) => {
        if (!(key in values)) throw new Error(`index.html: unknown placeholder ${placeholder}`)
        return values[key]
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "/wt-battlepass-helper/",
  plugins: [
    react(),
    htmlPlaceholders({
      siteUrl,
      seasonNumber: String(season.number),
      seasonName: season.name,
      seasonEnd: new Date(season.endDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
      appVersion: process.env.npm_package_version ?? "",
    }),
  ],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version)
  }
})
