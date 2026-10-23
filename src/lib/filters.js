// Filtrage de la liste des éditions à venir (ADR 0026).
// Fonctions pures, sans DOM : testées par `npm test`, utilisées au build
// (liste des pays) et dans le navigateur (lecture de l'URL, filtrage).
// Les filtres de l'epic #6 s'ajoutent en ET dans filterEditions() ; à
// l'intérieur d'un filtre, c'est un OU.

import { countryName, intlLocale } from "./editions.js";

const COUNTRY_PARAM = "country";
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

// Pays choisis pour le résumé du filtre : au plus `max` libellés, dans
// l'ordre de la liste (alphabétique), et le nombre de pays omis.
export function summarizeCountries(countries, selected, max = 2) {
  const wanted = new Set(selected);
  const labels = countries.filter((country) => wanted.has(country.code)).map((country) => country.label);
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
export function serializeFilterParams(search, { countries = [], from = "", to = "" } = {}) {
  const params = new URLSearchParams(search);
  for (const name of [COUNTRY_PARAM, FROM_PARAM, TO_PARAM]) params.delete(name);
  // Les virgules restent lisibles : ?country=FR,BE
  const parts = [...params].map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  if (countries.length > 0) parts.push(`${COUNTRY_PARAM}=${countries.join(",")}`);
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
export function filterEditions(editions, { countries = [], from = "", to = "" } = {}) {
  if (countries.length === 0 && !from && !to) return editions;
  const wanted = new Set(countries);
  return editions.filter(
    (edition) =>
      (wanted.size === 0 || wanted.has(edition.countryCode)) && overlapsPeriod(edition, from, to),
  );
}
