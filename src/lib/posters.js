// Affiches d'édition (#74, ADR 0030) : le lien entre un fichier et une
// édition tient dans le nom du fichier, `{slug}-{année}.webp`, dans
// src/assets/posters/. Fonctions pures, testées par `npm test`.

// slug : minuscules, chiffres et tirets ; année : quatre chiffres
const POSTER_FILE = /^([a-z0-9]+(?:-[a-z0-9]+)*)-(\d{4})\.webp$/;

/**
 * Nom du fichier d'affiche d'une édition.
 * @param {string} slug
 * @param {number} year
 * @returns {string}
 */
export function posterFileName(slug, year) {
  return `${slug}-${year}.webp`;
}

/**
 * Festival et année d'un nom de fichier d'affiche, ou null si le nom ne
 * respecte pas la convention.
 * @param {string} fileName
 * @returns {{ slug: string, year: number } | null}
 */
export function parsePosterFileName(fileName) {
  const match = POSTER_FILE.exec(fileName);
  return match && { slug: match[1], year: Number(match[2]) };
}

/**
 * Anomalies des fichiers d'affiche : nom hors convention, festival publié
 * inconnu, ou aucune édition visible de cette année. Une édition en attente
 * n'est pas visible au build : son affiche est signalée de même, pour qu'elle
 * ne parte pas en ligne avant la publication.
 * @param {string[]} fileNames noms de fichiers de src/assets/posters/
 * @param {{ festival: { slug: string }, editionYears: number[] }[]} sheets fiches de buildFestivalSheets()
 * @returns {string[]} un message par anomalie, vide si tout est en ordre
 */
export function findPosterProblems(fileNames, sheets) {
  const yearsBySlug = new Map(sheets.map((sheet) => [sheet.festival.slug, sheet.editionYears]));

  return fileNames.flatMap((fileName) => {
    const parsed = parsePosterFileName(fileName);
    if (!parsed) {
      return [`${fileName} : nom attendu {slug}-{année}.webp`];
    }
    const years = yearsBySlug.get(parsed.slug);
    if (!years) {
      return [`${fileName} : aucun festival publié « ${parsed.slug} »`];
    }
    if (!years.includes(parsed.year)) {
      return [`${fileName} : aucune édition ${parsed.year} visible pour « ${parsed.slug} »`];
    }
    return [];
  });
}
