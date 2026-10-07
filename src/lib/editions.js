// Tri et formatage des éditions pour l'affichage.
// Fonctions pures, sans accès réseau : testées par `npm test`.

// Langue de formatage pour chaque langue du site.
// en-GB : le jour avant le mois, comme partout en Europe.
const INTL_LOCALES = { fr: "fr", en: "en-GB" };

function intlLocale(locale) {
  if (!Object.hasOwn(INTL_LOCALES, locale)) {
    throw new Error(`Langue inconnue : ${locale}`);
  }
  return INTL_LOCALES[locale];
}

// Même ordre des noms dans les deux langues ; « Écho » se classe à E.
// numeric : « Metal Days 2 » passe avant « Metal Days 10 ».
const nameCollator = new Intl.Collator("fr", { numeric: true });

// Tri de la liste à venir (ADR 0019) : année, puis date de début, puis nom
// du festival. Dans une même année, les éditions sans date viennent après
// les éditions datées. L'id départage deux lignes par ailleurs identiques,
// pour qu'un build donne toujours le même ordre.
export function sortUpcomingEditions(editions) {
  return [...editions].sort(compareUpcomingEditions);
}

function compareUpcomingEditions(a, b) {
  if (a.year !== b.year) return a.year - b.year;

  if (a.startDate !== b.startDate) {
    if (a.startDate === null) return 1;
    if (b.startDate === null) return -1;
    // Dates ISO (AAAA-MM-JJ) : l'ordre des chaînes est celui des dates
    return a.startDate < b.startDate ? -1 : 1;
  }

  return (
    nameCollator.compare(a.festivalName, b.festivalName) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}

// « 6–8 octobre 2026 », « 6 novembre 2026 » pour un seul jour.
// Renvoie null pour une édition sans date : la page affiche alors
// « Dates non annoncées » (ADR 0016).
export function formatDateRange(startDate, endDate, locale) {
  const format = new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  if (!startDate) return null;

  const parts =
    !endDate || endDate === startDate
      ? format.formatToParts(toDate(startDate))
      : format.formatRangeToParts(toDate(startDate), toDate(endDate));

  return parts.map((part) => (isFrenchFirst(part, locale) ? "1er" : part.value)).join("");
}

// En français, le premier jour du mois s'écrit « 1er » ; Intl écrit « 1 ».
function isFrenchFirst(part, locale) {
  return locale === "fr" && part.type === "day" && part.value === "1";
}

// Une date de la base n'a pas de fuseau : on la lit et on l'affiche en UTC,
// pour que le jour ne dépende pas de la machine qui construit le site.
function toDate(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`);
}

// « Rennes, France ». Sans ville, le pays seul.
// Le pays est localisé à partir de son code ISO 3166-1.
export function formatLocation(city, countryCode, locale) {
  const country = new Intl.DisplayNames([intlLocale(locale)], { type: "region" }).of(countryCode);
  return city ? `${city}, ${country}` : country;
}
