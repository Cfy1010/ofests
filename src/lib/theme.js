// Thème du site (ADR 0021) : sombre par défaut, clair ou système par choix
// explicite du visiteur, mémorisé sur l'appareil. Le script de tête de
// src/layouts/Base.astro recopie readTheme() et applyTheme() à la main :
// toute modification ici doit y être reportée.

export const THEME_STORAGE_KEY = "ofests-theme";

// Ordre d'affichage du sélecteur : Clair / Sombre / Système
export const themes = /** @type {const} */ (["light", "dark", "system"]);

/** @typedef {(typeof themes)[number]} Theme */

/** Sans choix mémorisé, le site est sombre (identité, ADR 0021). */
export const DEFAULT_THEME = "dark";

/**
 * Thème valide, ou le thème par défaut pour toute autre valeur.
 * @param {unknown} value
 * @returns {Theme}
 */
export function parseTheme(value) {
  return themes.find((theme) => theme === value) ?? DEFAULT_THEME;
}

/**
 * Lit le thème mémorisé. Ne lève jamais : un stockage absent ou bloqué
 * (navigation privée, réglages du navigateur) donne le thème par défaut.
 * L'accès au stockage lui-même peut lever, d'où la fonction getStorage.
 * @param {() => Pick<Storage, "getItem">} getStorage
 * @returns {Theme}
 */
export function readTheme(getStorage) {
  try {
    return parseTheme(getStorage().getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Mémorise le thème choisi. Ne lève jamais ; renvoie false si le stockage
 * est indisponible (le thème s'applique quand même, sans être mémorisé).
 * @param {() => Pick<Storage, "setItem">} getStorage
 * @param {unknown} theme
 * @returns {boolean}
 */
export function writeTheme(getStorage, theme) {
  try {
    getStorage().setItem(THEME_STORAGE_KEY, parseTheme(theme));
    return true;
  } catch {
    return false;
  }
}

/**
 * Applique le thème à la racine du document (attribut data-theme, lu par
 * src/styles/global.css).
 * @param {{ dataset: Record<string, string | undefined> }} root
 * @param {unknown} theme
 * @returns {Theme}
 */
export function applyTheme(root, theme) {
  const parsed = parseTheme(theme);
  root.dataset.theme = parsed;
  return parsed;
}
