import { supabase } from "./supabase.js";

// Colonnes explicites : pas de `*`, pour ne pas embarquer submitted_by (#15).
// Le festival n'est jamais null : la RLS ne montre une édition que si son
// festival est visible (policy editions_select, testée dans rls.test.sql).
const COLUMNS = `
  id, year, start_date, end_date, city, country_code,
  festival:festivals ( name, genre:genres ( label_fr, label_en ) )
`;

// PostgREST plafonne chaque réponse (max_rows) : on lit par pages pour ne
// jamais tronquer la liste en silence.
const PAGE_SIZE = 1000;

// Éditions à venir visibles du public (vue upcoming_editions, ADR 0016).
// La RLS ne laisse passer que les fiches publiées. L'ordre renvoyé n'est
// pas celui de l'affichage : le tri se fait ensuite (ADR 0019).
// Une erreur fait échouer le build, pour ne pas publier une liste vide.
export async function fetchUpcomingEditions() {
  const editions = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("upcoming_editions")
      .select(COLUMNS)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Lecture de upcoming_editions impossible : ${error.message}`);
    }

    editions.push(...data.map(toEdition));
    if (data.length < PAGE_SIZE) break;
  }

  return editions;
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
    genreLabels: { fr: row.festival.genre.label_fr, en: row.festival.genre.label_en },
  };
}
