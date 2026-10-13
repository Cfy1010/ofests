// Langues du site : source unique, lue par astro.config.mjs, le layout et
// les composants. Module sans import, pour rester chargeable par la config
// Astro et par `node --test`.

export const locales = /** @type {const} */ (["fr", "en"]);

/**
 * Langue de la page, contrôlée. Astro.currentLocale est typé
 * string | undefined ; une page hors des dossiers de langue fait échouer
 * le build.
 * @param {string | undefined} value
 * @returns {(typeof locales)[number]}
 */
export function toLocale(value) {
  const locale = locales.find((candidate) => candidate === value);
  if (!locale) {
    throw new Error(`Langue de page inconnue : ${value}`);
  }
  return locale;
}
