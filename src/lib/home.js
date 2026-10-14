// Accueil du site : la cible du logo (#24). Source unique, à changer ici le
// jour où une vraie page d'accueil existera. Tant qu'elle n'existe pas,
// l'accueil d'une langue est la liste des festivals à venir. Jamais `/`,
// qui redirige vers l'anglais quelle que soit la langue de la page.

/** Chemin de l'accueil, sans préfixe de langue, comme le `path` des pages. */
export const HOME_PATH = "festivals";

/**
 * Chemin sans barres obliques au début ni à la fin : "/festivals/" et
 * "festivals" désignent la même page.
 * @param {string} path
 * @returns {string}
 */
function trimSlashes(path) {
  return path.replace(/^\/+|\/+$/g, "");
}

/**
 * Vrai si le chemin (sans préfixe de langue) est celui de l'accueil, quelle
 * que soit l'écriture des barres obliques.
 * @param {string | undefined} path
 * @returns {boolean}
 */
export function isHomePath(path) {
  return trimSlashes(path ?? "") === trimSlashes(HOME_PATH);
}
