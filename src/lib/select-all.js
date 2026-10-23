// Lecture complète d'une table ou d'une vue, au build.
// PostgREST plafonne chaque réponse (max_rows) : on lit par pages pour ne
// jamais tronquer un résultat en silence. Une erreur, même sur une page
// suivante, fait échouer le build : ni liste vide ni liste partielle en ligne.
// Colonnes toujours explicites : `*` est refusé aux rôles publics, qui ne
// lisent pas submitted_by (ADR 0025).

export const PAGE_SIZE = 1000;

/**
 * @param {any} supabase client Supabase, ou un faux client dans les tests
 * @param {string} table
 * @param {string} columns
 * @param {string} [orderBy] colonne de tri stable pour la pagination (défaut : id)
 * @returns {Promise<any[]>}
 */
export async function selectAll(supabase, table, columns, orderBy = "id") {
  const rows = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(orderBy)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Lecture de ${table} impossible : ${error.message}`);
    }

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return rows;
}
