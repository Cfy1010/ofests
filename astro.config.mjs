// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

import { locales } from "./src/i18n/locales.js";

// https://astro.build/config
export default defineConfig({
  site: "https://ofests.com",
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "fr",
        locales: Object.fromEntries(locales.map((locale) => [locale, locale])),
      },
    }),
  ],

  // Les deux langues portent leur préfixe : /fr/ et /en/
  i18n: {
    defaultLocale: "fr",
    locales: [...locales],
    routing: {
      prefixDefaultLocale: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
