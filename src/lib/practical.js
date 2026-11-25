// Infos pratiques d'une édition (#46, ADR 0033) : prix, camping,
// accessibilité, avec une source pour toute la section.
// Fonctions pures, sans accès réseau : testées par `npm test`.

import { formatDateRange, intlLocale } from "./editions.js";

/**
 * @typedef {"unspecified" | "free" | "from"} PriceKind
 * @typedef {"unspecified" | "yes" | "no"} Availability
 * @typedef {{ url: string, kind: string, consultedOn: string }} PracticalSource
 * @typedef {object} Practical
 * @property {PriceKind} priceKind
 * @property {number | null} priceAmount plus bas plein tarif, si priceKind vaut "from"
 * @property {string | null} priceCurrency code ISO 4217, si priceKind vaut "from"
 * @property {Availability} camping
 * @property {Availability} accessibility
 * @property {PracticalSource | null} source null : édition pas encore vérifiée
 */

/**
 * Infos pratiques d'une édition et leur source, prise parmi les sources de
 * l'édition (la base garantit qu'elle en fait partie).
 * @param {any} edition édition au format de toEdition() (festivals.js)
 * @param {any[]} sources sources visibles, avec leur id
 * @returns {Practical}
 */
export function buildPractical(edition, sources) {
  const source = edition.practicalSourceId
    ? sources.find((candidate) => candidate.id === edition.practicalSourceId)
    : undefined;

  return {
    priceKind: edition.priceKind,
    priceAmount: edition.priceAmount,
    priceCurrency: edition.priceCurrency,
    camping: edition.camping,
    accessibility: edition.accessibility,
    source: source ? { url: source.url, kind: source.kind, consultedOn: source.consultedOn } : null,
  };
}

/**
 * Montant dans la devise, au format de la langue : sans décimales quand il
 * est rond (« 89 € », « €89 »), avec deux sinon (« 89,50 € »).
 * @param {number} amount
 * @param {string} currency code ISO 4217
 * @param {"fr" | "en"} locale
 * @returns {string}
 */
export function formatPrice(amount, currency, locale) {
  const digits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

/**
 * @typedef {object} PracticalView
 * @property {PriceKind} priceKind
 * @property {string | null} price montant formaté, si priceKind vaut "from"
 * @property {Availability} camping
 * @property {Availability} accessibility
 * @property {{ url: string, consultedOn: string } | null} source date formatée
 */

/**
 * Contenu affichable de la section dans une langue. Le composant choisit
 * les libellés : « Non précisé », « Gratuit », « À partir de {price} »…
 * @param {Practical} practical
 * @param {"fr" | "en"} locale
 * @returns {PracticalView}
 */
export function practicalView(practical, locale) {
  const { priceKind, priceAmount, priceCurrency, camping, accessibility, source } = practical;
  return {
    priceKind,
    price:
      priceKind === "from" && priceAmount !== null && priceCurrency
        ? formatPrice(priceAmount, priceCurrency, locale)
        : null,
    camping,
    accessibility,
    source: source && {
      url: source.url,
      consultedOn: /** @type {string} */ (formatDateRange(source.consultedOn, null, locale)),
    },
  };
}
