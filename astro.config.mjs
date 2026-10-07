// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://ofests.com",
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "fr",
        locales: { fr: "fr", en: "en" },
      },
    }),
  ],

  // Les deux langues portent leur préfixe : /fr/ et /en/
  i18n: {
    defaultLocale: "fr",
    locales: ["fr", "en"],
    routing: {
      prefixDefaultLocale: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
