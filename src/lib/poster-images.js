// Affiches d'édition (#74, ADR 0030) : les fichiers de src/assets/posters/,
// traités par le composant Image d'Astro. Dépend de Vite (import.meta.glob) :
// la logique testable est dans posters.js.

import { findPosterProblems, posterFileName } from "./posters.js";

const posters = import.meta.glob("../assets/posters/*.webp", { eager: true, import: "default" });

const fileNames = Object.keys(posters).map((path) => path.slice(path.lastIndexOf("/") + 1));

/**
 * Affiche d'une édition, ou undefined si elle n'en a pas.
 * @param {string} slug
 * @param {number} year
 * @returns {import("astro").ImageMetadata | undefined}
 */
export function findPoster(slug, year) {
  return /** @type {any} */ (posters)[`../assets/posters/${posterFileName(slug, year)}`];
}

/**
 * Contrôle au build : chaque affiche correspond à une édition visible. Une
 * anomalie fait échouer le build (une affiche sur la mauvaise édition est
 * l'erreur à éviter) ; en développement, elle est signalée sans bloquer, la
 * base locale n'ayant pas les festivals réels.
 * @param {any[]} sheets fiches de fetchFestivalSheets()
 */
export function checkPosters(sheets) {
  const problems = findPosterProblems(fileNames, sheets);
  if (problems.length === 0) return;

  const message = `Affiches incohérentes (src/assets/posters/) :\n${problems.join("\n")}`;
  if (import.meta.env.PROD) {
    throw new Error(message);
  }
  console.warn(message);
}
