import { selectAll } from "./select-all.js";

// Colonnes explicites, comme partout (ADR 0025) : la vue n'expose pas
// submitted_by, et festivals refuse `*` aux rôles publics.
// Le festival n'est jamais null : la RLS ne montre une édition que si son
// festival est visible (policy editions_select, testée dans rls.test.sql).
const COLUMNS = `
  id, year, start_date, end_date, city, country_code,
  festival:festivals ( name, slug, genre:genres ( label_fr, label_en ) )
`;

// Éditions à venir visibles du public (vue upcoming_editions, ADR 0016).
// La RLS ne laisse passer que les fiches publiées. L'ordre renvoyé n'est
// pas celui de l'affichage : le tri se fait ensuite (ADR 0019).
// Une erreur fait échouer le build, pour ne pas publier une liste vide.
// Le client Supabase est reçu en paramètre : les tests en passent un faux.
export async function fetchUpcomingEditions(supabase) {
  const rows = await selectAll(supabase, "upcoming_editions", COLUMNS);
  return rows.map(toEdition);
}

function toEdition(row) {
  return {
    id: row.id,
    year: row.year,
    startDate: row.start_date,
    endDate: row.end_date,
    city: row.city,
    countryCode: row.country_code,
    festivalName: row.festival.name,
    festivalSlug: row.festival.slug,
    genreLabels: { fr: row.festival.genre.label_fr, en: row.festival.genre.label_en },
  };
}
