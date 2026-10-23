// Filtrage de la liste des éditions à venir (ADR 0026).
// Fonctions pures, sans DOM : testées par `npm test`, utilisées au build
// (liste des pays) et dans le navigateur (lecture de l'URL, filtrage).
// Les filtres de l'epic #6 s'ajoutent en ET dans filterEditions() ; à
// l'intérieur d'un filtre, c'est un OU.

import { countryName, intlLocale } from "./editions.js";

const COUNTRY_PARAM = "country";
const GENRE_PARAM = "genre";
const ALL_STYLES = "all-styles";
const FROM_PARAM = "from";
const TO_PARAM = "to";
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// Pays ayant au moins une édition à venir, libellés dans la langue de la
// page, triés alphabétiquement selon cette langue.
export function availableCountries(editions, locale) {
  const collator = new Intl.Collator(locale);
  const codes = [...new Set(editions.map((edition) => edition.countryCode))];
  return codes
    .map((code) => ({ code, label: countryName(code, locale) }))
    .sort((a, b) => collator.compare(a.label, b.label));
}

// Choix retenus pour le résumé d'un filtre : au plus `max` libellés, dans
// l'ordre de la liste (alphabétique), et le nombre de choix omis.
// items : [{ code, label }] (pays, ou genres de flattenGenreOptions()).
export function summarizeSelection(items, selected, max = 2) {
  const wanted = new Set(selected);
  const labels = items.filter((item) => wanted.has(item.code)).map((item) => item.label);
  return { labels: labels.slice(0, max), more: Math.max(0, labels.length - max) };
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

// Options du filtre de genre (ADR 0017, 0026) : la hiérarchie utilisée par
// une édition à venir. `genres` : de fetchGenres(). Une tendance est proposée
// si elle-même ou l'un de ses genres est utilisé ; un genre, s'il est
// utilisé. Archivés exclus (un genre dont la tendance est archivée n'a pas
// de place dans la liste), `all-styles` aussi : ces festivals sont toujours
// retenus. Tendances et genres triés dans la langue de la page.
// Chaque tendance : { slug, label, children: [{ slug, label }] }.
export function genreOptions(genres, editions, locale) {
  const used = new Set(editions.map((edition) => edition.genreSlug));
  const collator = new Intl.Collator(locale);
  const byLabel = (a, b) => collator.compare(a.label, b.label);
  const option = (genre) => ({ slug: genre.slug, label: genre.labels[locale] });

  return genres
    .filter((genre) => genre.parentSlug === null && genre.slug !== ALL_STYLES && !genre.archived)
    .map((trend) => ({
      ...option(trend),
      children: genres
        .filter((genre) => genre.parentSlug === trend.slug && !genre.archived && used.has(genre.slug))
        .map(option)
        .sort(byLabel),
    }))
    .filter((trend) => used.has(trend.slug) || trend.children.length > 0)
    .sort(byLabel);
}

// Options à plat, tendance puis ses genres, au format de summarizeSelection().
export function flattenGenreOptions(options) {
  return options.flatMap((trend) =>
    [trend, ...trend.children].map((item) => ({ code: item.slug, label: item.label })),
  );
}

// Slugs qui font retenir une édition par le filtre de genre : son genre
// principal, sa tendance parente, et — si c'est une tendance — ses genres
// proposés. « Black metal » coché retient donc un festival « Extrême ».
export function genreKeys(edition, options) {
  const keys = [edition.genreSlug];
  if (edition.genreParentSlug) keys.push(edition.genreParentSlug);
  const trend = options.find((option) => option.slug === edition.genreSlug);
  if (trend) keys.push(...trend.children.map((child) => child.slug));
  return keys;
}

// Slugs de la query (`?genre=extreme,doom-metal`). Les slugs inconnus ou
// absents des options sont ignorés en silence ; un genre dont la tendance
// est aussi présente est retiré (redondant).
export function parseGenreParam(search, options) {
  const parentOf = new Map();
  for (const trend of options) {
    parentOf.set(trend.slug, null);
    for (const child of trend.children) parentOf.set(child.slug, trend.slug);
  }
  const value = new URLSearchParams(search).get(GENRE_PARAM) ?? "";
  const slugs = [
    ...new Set(
      value
        .split(",")
        .map((slug) => slug.trim())
        .filter((slug) => parentOf.has(slug)),
    ),
  ];
  return slugs.filter((slug) => !slugs.includes(parentOf.get(slug)));
}

// Mois proposés par le filtre de période : tous les mois, en continu, du mois
// de `today` (UTC, comme les dates des éditions) jusqu'au dernier mois
// couvert par une édition à venir. Une édition sans date couvre jusqu'à
// décembre de son année. Un mois sans édition reste proposé.
// Chaque mois : { value: "2027-06", label: "juin 2027", monthLabel: "juin" }.
export function availableMonths(editions, today, locale) {
  if (editions.length === 0) return [];
  const last = editions.map(lastMonth).reduce((a, b) => (a > b ? a : b));
  const monthFormat = new Intl.DateTimeFormat(intlLocale(locale), { month: "long", timeZone: "UTC" });
  const fullFormat = new Intl.DateTimeFormat(intlLocale(locale), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const months = [];
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  do {
    months.push({
      value: cursor.toISOString().slice(0, 7),
      label: fullFormat.format(cursor),
      monthLabel: monthFormat.format(cursor),
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  } while (cursor.toISOString().slice(0, 7) <= last);
  return months;
}

// Dernier mois couvert par une édition (AAAA-MM).
function lastMonth(edition) {
  const date = edition.endDate ?? edition.startDate;
  return date ? date.slice(0, 7) : `${edition.year}-12`;
}

// Bornes de la query (`?from=2027-06&to=2027-08`). `available` : les valeurs
// AAAA-MM proposées. Une valeur invalide ou hors liste est ignorée en
// silence ; début > fin : les bornes sont inversées. Absente : "".
export function parsePeriodParam(search, available) {
  const params = new URLSearchParams(search);
  const known = new Set(available);
  const read = (name) => {
    const value = (params.get(name) ?? "").trim();
    return MONTH_PATTERN.test(value) && known.has(value) ? value : "";
  };
  const from = read(FROM_PARAM);
  const to = read(TO_PARAM);
  return from && to && from > to ? { from: to, to: from } : { from, to };
}

// Résumé de la période pour le filtre. `months` : de availableMonths().
// Renvoie { kind: "range" | "from" | "to", text }, ou null sans borne.
// « juin – août 2027 », « juin 2027 – janvier 2028 », « juin 2027 ».
export function summarizePeriod(months, from, to) {
  const start = months.find((month) => month.value === from);
  const end = months.find((month) => month.value === to);
  if (start && end) {
    if (start.value === end.value) return { kind: "range", text: start.label };
    const sameYear = start.value.slice(0, 4) === end.value.slice(0, 4);
    return { kind: "range", text: `${sameYear ? start.monthLabel : start.label} – ${end.label}` };
  }
  if (start) return { kind: "from", text: start.label };
  if (end) return { kind: "to", text: end.label };
  return null;
}

// Query mise à jour avec les filtres, les autres paramètres conservés.
// Un filtre vide retire son paramètre. Renvoie "" ou "?…".
export function serializeFilterParams(search, { countries = [], genres = [], from = "", to = "" } = {}) {
  const params = new URLSearchParams(search);
  for (const name of [COUNTRY_PARAM, GENRE_PARAM, FROM_PARAM, TO_PARAM]) params.delete(name);
  // Les virgules restent lisibles : ?country=FR,BE
  const parts = [...params].map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  if (countries.length > 0) parts.push(`${COUNTRY_PARAM}=${countries.join(",")}`);
  if (genres.length > 0) parts.push(`${GENRE_PARAM}=${genres.join(",")}`);
  if (from) parts.push(`${FROM_PARAM}=${from}`);
  if (to) parts.push(`${TO_PARAM}=${to}`);
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

// Une édition recoupe la période [from, to] (AAAA-MM, bornes facultatives).
// Datée : mois(début) <= to et mois(fin, à défaut début) >= from. Sans date :
// année(from) <= année <= année(to).
function overlapsPeriod(edition, from, to) {
  if (!edition.startDate) {
    return (
      (!from || Number(from.slice(0, 4)) <= edition.year) &&
      (!to || edition.year <= Number(to.slice(0, 4)))
    );
  }
  const start = edition.startDate.slice(0, 7);
  const end = (edition.endDate ?? edition.startDate).slice(0, 7);
  return (!to || start <= to) && (!from || end >= from);
}

// Éditions retenues par les critères, en ET. Un critère vide ne filtre pas.
// Genre : l'édition porte `genreSlug` et `genreKeys` (genreKeys()). Un
// festival « toutes tendances » est toujours retenu par ce filtre, mais reste
// soumis aux autres.
export function filterEditions(editions, { countries = [], genres = [], from = "", to = "" } = {}) {
  if (countries.length === 0 && genres.length === 0 && !from && !to) return editions;
  const wantedCountries = new Set(countries);
  const wantedGenres = new Set(genres);
  return editions.filter(
    (edition) =>
      (wantedCountries.size === 0 || wantedCountries.has(edition.countryCode)) &&
      (wantedGenres.size === 0 ||
        edition.genreSlug === ALL_STYLES ||
        edition.genreKeys.some((key) => wantedGenres.has(key))) &&
      overlapsPeriod(edition, from, to),
  );
}
