import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { fetchGenres, fetchUpcomingEditions } from "./upcoming.js";

// Faux client Supabase : renvoie, dans l'ordre, une réponse par page lue,
// et note chaque requête dans `calls`.
function fakeClient(responses) {
  const calls = [];
  return {
    calls,
    from(table) {
      const query = { table };
      return {
        select(columns) {
          query.columns = columns;
          return this;
        },
        order(column) {
          query.order = column;
          return this;
        },
        range(from, to) {
          calls.push({ ...query, from, to });
          return Promise.resolve(responses[calls.length - 1]);
        },
      };
    },
  };
}

function row(n) {
  return {
    id: `id-${n}`,
    year: 2027,
    start_date: "2027-06-18",
    end_date: "2027-06-20",
    city: "Liège",
    country_code: "BE",
    festival: {
      name: `Festival ${n}`,
      slug: `festival-${n}`,
      genre: {
        slug: "folk-pagan",
        parent_slug: "folk",
        archived: false,
        label_fr: "Folk & pagan",
        label_en: "Folk & Pagan",
      },
    },
  };
}

function rows(count, first = 0) {
  return Array.from({ length: count }, (_, i) => row(first + i));
}

describe("fetchUpcomingEditions", () => {
  test("échoue quand Supabase renvoie une erreur, au lieu de renvoyer une liste vide", async () => {
    const client = fakeClient([{ data: null, error: { message: "TypeError: fetch failed" } }]);

    await assert.rejects(
      fetchUpcomingEditions(client),
      /Lecture de upcoming_editions impossible : TypeError: fetch failed/,
    );
  });

  test("échoue si l'erreur survient sur une page suivante, sans liste partielle", async () => {
    const client = fakeClient([
      { data: rows(1000), error: null },
      { data: null, error: { message: "timeout" } },
    ]);

    await assert.rejects(fetchUpcomingEditions(client), /impossible : timeout/);
  });

  test("renvoie une liste vide quand la vue ne contient aucune édition", async () => {
    const client = fakeClient([{ data: [], error: null }]);

    assert.deepEqual(await fetchUpcomingEditions(client), []);
  });

  test("met une ligne de la vue à la forme attendue par l'affichage", async () => {
    const client = fakeClient([{ data: [row(1)], error: null }]);

    assert.deepEqual(await fetchUpcomingEditions(client), [
      {
        id: "id-1",
        year: 2027,
        startDate: "2027-06-18",
        endDate: "2027-06-20",
        city: "Liège",
        countryCode: "BE",
        festivalName: "Festival 1",
        festivalSlug: "festival-1",
        genreLabels: { fr: "Folk & pagan", en: "Folk & Pagan" },
        genreSlug: "folk-pagan",
        genreParentSlug: "folk",
        genreArchived: false,
      },
    ]);
  });

  test("lit la page suivante tant qu'une page est pleine", async () => {
    const client = fakeClient([
      { data: rows(1000), error: null },
      { data: rows(3, 1000), error: null },
    ]);

    const editions = await fetchUpcomingEditions(client);

    assert.equal(editions.length, 1003);
    assert.equal(editions.at(-1).id, "id-1002");
    assert.deepEqual(
      client.calls.map((call) => [call.from, call.to]),
      [
        [0, 999],
        [1000, 1999],
      ],
    );
  });

  test("lit la vue upcoming_editions, sans `*` ni submitted_by", async () => {
    const client = fakeClient([{ data: [], error: null }]);

    await fetchUpcomingEditions(client);

    const [call] = client.calls;
    assert.equal(call.table, "upcoming_editions");
    assert.equal(call.order, "id");
    assert.doesNotMatch(call.columns, /\*|submitted_by/);
  });
});

describe("fetchGenres", () => {
  test("lit la table genres triée par slug, colonnes explicites, par pages", async () => {
    const client = fakeClient([{ data: [], error: null }]);

    await fetchGenres(client);

    const [call] = client.calls;
    assert.equal(call.table, "genres");
    assert.equal(call.order, "slug");
    assert.doesNotMatch(call.columns, /\*/);
  });

  test("met une ligne à la forme attendue, archivés compris", async () => {
    const client = fakeClient([
      {
        data: [
          { slug: "doom-metal", parent_slug: "doom-stoner", label_fr: "Doom metal", label_en: "Doom metal", archived: true },
        ],
        error: null,
      },
    ]);

    assert.deepEqual(await fetchGenres(client), [
      {
        slug: "doom-metal",
        parentSlug: "doom-stoner",
        archived: true,
        labels: { fr: "Doom metal", en: "Doom metal" },
      },
    ]);
  });

  test("échoue sur erreur, au lieu de renvoyer une liste vide", async () => {
    const client = fakeClient([{ data: null, error: { message: "timeout" } }]);

    await assert.rejects(fetchGenres(client), /Lecture de genres impossible : timeout/);
  });

  test("lit la page suivante tant qu'une page est pleine", async () => {
    const full = Array.from({ length: 1000 }, (_, i) => ({
      slug: `g-${i}`, parent_slug: null, label_fr: "x", label_en: "x", archived: false,
    }));
    const client = fakeClient([
      { data: full, error: null },
      { data: [], error: null },
    ]);

    assert.equal((await fetchGenres(client)).length, 1000);
    assert.equal(client.calls.length, 2);
  });
});
