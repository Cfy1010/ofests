// Filtrage de la liste des éditions à venir (ADR 0026).
// Fonctions pures, sans DOM : testées par `npm test`, utilisées au build
// (liste des pays) et dans le navigateur (lecture de l'URL, filtrage).
// Les filtres de l'epic #6 s'ajoutent en ET dans filterEditions() ; à
// l'intérieur d'un filtre, c'est un OU.

import { countryName } from "./editions.js";

const COUNTRY_PARAM = "country";

// Pays ayant au moins une édition à venir, libellés dans la langue de la
// page, triés alphabétiquement selon cette langue.
export function availableCountries(editions, locale) {
  const collator = new Intl.Collator(locale);
  const codes = [...new Set(editions.map((edition) => edition.countryCode))];
  return codes
    .map((code) => ({ code, label: countryName(code, locale) }))
    .sort((a, b) => collator.compare(a.label, b.label));
}

// Codes pays de la query (`?country=FR,BE`). Majuscules, sans doublon ;
// les codes absents de `available` sont ignorés en silence.
export function parseCountryParam(search, available) {
  const value = new URLSearchParams(search).get(COUNTRY_PARAM) ?? "";
  const known = new Set(available);
  const codes = value
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter((code) => known.has(code));
  return [...new Set(codes)];
}

// Query mise à jour avec les pays choisis, les autres paramètres conservés.
// Sans pays, le paramètre disparaît. Renvoie "" ou "?…".
export function serializeCountryParam(search, countries) {
  const params = new URLSearchParams(search);
  params.delete(COUNTRY_PARAM);
  // Les virgules restent lisibles : ?country=FR,BE
  const parts = [...params].map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  if (countries.length > 0) parts.push(`${COUNTRY_PARAM}=${countries.join(",")}`);
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

// Éditions retenues par les critères. Un critère vide ne filtre pas.
export function filterEditions(editions, { countries = [] } = {}) {
  if (countries.length === 0) return editions;
  const wanted = new Set(countries);
  return editions.filter((edition) => wanted.has(edition.countryCode));
}
