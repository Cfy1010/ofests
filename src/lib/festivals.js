// Fiches festival (#5, ADR 0023) : lecture au build, choix de l'édition
// présentée, sources, date de révision et données structurées.
// Seule fetchFestivalSheets() accède au réseau ; le reste est pur et testé
// par `npm test`.

import { formatDateRange, formatLocation, sortUpcomingEditions } from "./editions.js";
import { selectAll } from "./select-all.js";

// Colonnes explicites : `*` et submitted_by sont refusés aux rôles publics,
// une colonne non accordée fait échouer le build (ADR 0025). Avec la clé
// publishable, la RLS ne laisse passer que les fiches publiées.
const FESTIVAL_COLUMNS = "id, name, slug, website, subgenres, revised_at, genre:genres ( label_fr, label_en )";
const EDITION_COLUMNS =
  "id, festival_id, year, start_date, end_date, venue_name, city, postcode, region, country_code, revised_at";
const SOURCE_COLUMNS = "id, festival_id, edition_id, url, kind, consulted_on";

/**
 * Chemin d'une fiche, sans préfixe de langue, comme le `path` des pages.
 * Source unique pour les routes, le layout et les liens de la liste.
 * @param {string} slug
 * @returns {string}
 */
export function festivalPath(slug) {
  return `festivals/${slug}`;
}

// Fiches de tous les festivals publiés, avec ou sans édition (ADR 0023).
// Quatre requêtes quel que soit le nombre de festivals. « À venir » reste
// défini par la vue upcoming_editions (ADR 0016) : on n'en lit que les id.
// Une erreur fait échouer le build (selectAll).
export async function fetchFestivalSheets(supabase) {
  const [festivals, editions, upcoming, sources] = await Promise.all([
    selectAll(supabase, "festivals", FESTIVAL_COLUMNS),
    selectAll(supabase, "editions", EDITION_COLUMNS),
    selectAll(supabase, "upcoming_editions", "id"),
    selectAll(supabase, "sources", SOURCE_COLUMNS),
  ]);

  return buildFestivalSheets(
    festivals.map(toFestival),
    editions.map(toEdition),
    upcoming.map((row) => row.id),
    sources.map(toSource),
  );
}

function toFestival(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    website: row.website,
    subgenres: row.subgenres,
    revisedAt: row.revised_at,
    genreLabels: { fr: row.genre.label_fr, en: row.genre.label_en },
  };
}

function toEdition(row) {
  return {
    id: row.id,
    festivalId: row.festival_id,
    year: row.year,
    startDate: row.start_date,
    endDate: row.end_date,
    venueName: row.venue_name,
    city: row.city,
    postcode: row.postcode,
    region: row.region,
    countryCode: row.country_code,
    revisedAt: row.revised_at,
  };
}

function toSource(row) {
  return {
    festivalId: row.festival_id,
    editionId: row.edition_id,
    url: row.url,
    kind: row.kind,
    consultedOn: row.consulted_on,
  };
}

/**
 * Assemble une fiche par festival, triées par slug pour un build stable.
 * @param {any[]} festivals
 * @param {any[]} editions éditions visibles, tous festivals confondus
 * @param {string[]} upcomingIds id des éditions de la vue upcoming_editions
 * @param {any[]} sources sources visibles, de festival ou d'édition
 */
export function buildFestivalSheets(festivals, editions, upcomingIds, sources) {
  const upcoming = new Set(upcomingIds);

  return [...festivals]
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
    .map((festival) => {
      const presented = selectPresentedEdition(
        editions.filter((edition) => edition.festivalId === festival.id),
        upcoming,
      );
      const edition = presented.edition;

      return {
        festival,
        presented,
        // Sources du festival d'abord, puis de l'édition présentée
        sources: mergeSources([
          ...sources.filter((source) => source.festivalId === festival.id),
          ...(edition ? sources.filter((source) => source.editionId === edition.id) : []),
        ]),
        revisedOn: latestRevision(festival.revisedAt, edition?.revisedAt),
      };
    });
}

/**
 * Édition présentée sur la fiche (ADR 0023) : la prochaine édition à venir,
 * dans l'ordre de la liste (ADR 0019) ; à défaut, la dernière édition
 * passée ; à défaut, aucune.
 * @param {any[]} editions éditions d'un seul festival
 * @param {Set<string>} upcomingIds
 * @returns {{ kind: "upcoming" | "past" | "none", edition: any }}
 */
export function selectPresentedEdition(editions, upcomingIds) {
  const upcoming = editions.filter((edition) => upcomingIds.has(edition.id));
  if (upcoming.length > 0) {
    return { kind: "upcoming", edition: sortUpcomingEditions(upcoming)[0] };
  }

  // Une édition par année et par festival (contrainte unique) : la plus
  // récente année est la dernière édition.
  const past = [...editions].sort((a, b) => b.year - a.year);
  if (past.length > 0) {
    return { kind: "past", edition: past[0] };
  }

  return { kind: "none", edition: null };
}

/**
 * Une ligne par URL : une même page peut sourcer le festival et l'édition.
 * On garde la consultation la plus récente, à la place de la première
 * occurrence (sources du festival d'abord, puis de l'édition).
 * @param {any[]} sources
 */
export function mergeSources(sources) {
  /** @type {Map<string, any>} */
  const byUrl = new Map();
  for (const source of sources) {
    const seen = byUrl.get(source.url);
    if (!seen) {
      byUrl.set(source.url, { url: source.url, kind: source.kind, consultedOn: source.consultedOn });
    } else if (source.consultedOn > seen.consultedOn) {
      // Dates ISO (AAAA-MM-JJ) : l'ordre des chaînes est celui des dates
      byUrl.set(source.url, { ...seen, kind: source.kind, consultedOn: source.consultedOn });
    }
  }
  return [...byUrl.values()];
}

/**
 * Date de dernière révision (ADR 0007) : la plus récente entre celle du
 * festival et celle de l'édition présentée, en jour UTC (AAAA-MM-JJ).
 * @param {string} festivalRevisedAt horodatage ISO
 * @param {string | null | undefined} editionRevisedAt
 * @returns {string}
 */
export function latestRevision(festivalRevisedAt, editionRevisedAt) {
  const times = [festivalRevisedAt, editionRevisedAt].filter(Boolean).map((value) => Date.parse(value));
  return new Date(Math.max(...times)).toISOString().slice(0, 10);
}

/**
 * Bloc JSON-LD MusicEvent de la fiche (ADR 0012, 0023). Seulement pour une
 * édition à venir qui a une date de début ; sinon null, et la page ne publie
 * aucun Event. Ni performer ni offers : le schéma ne porte ni affiche ni
 * billetterie. Les champs d'adresse absents sont omis, jamais inventés.
 * @param {any} sheet fiche de buildFestivalSheets()
 * @param {string} pageUrl URL absolue de la fiche dans la langue de la page
 */
export function buildMusicEventJsonLd(sheet, pageUrl) {
  const { festival, presented } = sheet;
  const edition = presented.edition;
  if (presented.kind !== "upcoming" || !edition.startDate) return null;

  const address = {
    "@type": "PostalAddress",
    ...(edition.city && { addressLocality: edition.city }),
    ...(edition.postcode && { postalCode: edition.postcode }),
    ...(edition.region && { addressRegion: edition.region }),
    addressCountry: edition.countryCode,
  };

  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: `${festival.name} ${edition.year}`,
    url: pageUrl,
    startDate: edition.startDate,
    ...(edition.endDate && { endDate: edition.endDate }),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      ...(edition.venueName && { name: edition.venueName }),
      address,
    },
  };
}

/**
 * @typedef {object} SheetView
 * @property {string} name
 * @property {string} genre libellé du genre principal dans la langue de la page
 * @property {string[]} subgenres tags libres, non traduits (ADR 0017)
 * @property {string | null} website
 * @property {"upcoming" | "past" | "none"} editionKind
 * @property {{ year: number, dates: string | null, venue: string | null, location: string } | null} edition
 *   dates null : « Dates non annoncées »
 * @property {{ kind: string, url: string, label: string, consultedOn: string }[]} sources
 * @property {string} revisedOn date formatée
 * @property {string | null} jsonLd bloc sérialisé, ou null : aucun Event
 */

/**
 * Contenu affichable d'une fiche dans une langue : textes formatés avec les
 * formats de la liste (dates, lieu), le composant n'ajoute que les libellés.
 * @param {any} sheet fiche de buildFestivalSheets()
 * @param {"fr" | "en"} locale
 * @param {string} pageUrl URL absolue de la fiche dans cette langue
 * @returns {SheetView}
 */
export function festivalSheetView(sheet, locale, pageUrl) {
  const { festival, presented, sources, revisedOn } = sheet;
  const edition = presented.edition;
  const jsonLd = buildMusicEventJsonLd(sheet, pageUrl);

  return {
    name: festival.name,
    genre: festival.genreLabels[locale],
    subgenres: festival.subgenres,
    website: festival.website,
    editionKind: presented.kind,
    edition: edition && {
      year: edition.year,
      dates: formatDateRange(edition.startDate, edition.endDate, locale),
      venue: edition.venueName,
      location: formatLocation(edition.city, edition.countryCode, locale),
    },
    sources: sources.map((source) => ({
      kind: source.kind,
      url: source.url,
      label: displayUrl(source.url),
      consultedOn: /** @type {string} */ (formatDateRange(source.consultedOn, null, locale)),
    })),
    revisedOn: /** @type {string} */ (formatDateRange(revisedOn, null, locale)),
    jsonLd: jsonLd && serializeJsonLd(jsonLd),
  };
}

/**
 * URL lisible pour le texte d'un lien : sans protocole ni barre finale.
 * @param {string} url
 * @returns {string}
 */
export function displayUrl(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * JSON pour une balise <script type="application/ld+json">. `<` est échappé :
 * aucune donnée ne peut fermer la balise (« </script> » dans un nom).
 * @param {unknown} value
 * @returns {string}
 */
export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
