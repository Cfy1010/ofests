import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildFestivalSheets,
  buildMusicEventJsonLd,
  displayUrl,
  fetchFestivalSheets,
  festivalPath,
  festivalSheetView,
  latestRevision,
  mergeSources,
  selectPresentedEdition,
  serializeJsonLd,
} from "./festivals.js";

function festival(overrides = {}) {
  return {
    id: "f1",
    name: "Granit Open Air",
    slug: "granit-open-air",
    website: "https://granit-open-air.example",
    subgenres: [],
    revisedAt: "2026-10-01T08:00:00+00:00",
    genreLabels: { fr: "Heavy metal", en: "Heavy Metal" },
    ...overrides,
  };
}

function edition(overrides = {}) {
  return {
    id: "e1",
    festivalId: "f1",
    year: 2027,
    startDate: "2027-06-17",
    endDate: "2027-06-20",
    venueName: "Výstaviště",
    city: "Brno",
    postcode: "603 00",
    region: "Jihomoravský kraj",
    countryCode: "CZ",
    revisedAt: "2026-10-01T08:00:00+00:00",
    ...overrides,
  };
}

function source(overrides = {}) {
  return {
    festivalId: "f1",
    editionId: null,
    url: "https://granit-open-air.example/",
    kind: "official",
    consultedOn: "2026-10-01",
    ...overrides,
  };
}

const PAGE_URL = "https://ofests.com/fr/festivals/granit-open-air/";

// Intl sépare les éléments d'une plage par des espaces fines, qui varient
// selon la version d'ICU : on les ramène à des espaces simples.
function plain(text) {
  return text.replace(/\s/gu, " ");
}

describe("festivalPath", () => {
  test("place la fiche sous la liste, sans préfixe de langue", () => {
    assert.equal(festivalPath("hellfest"), "festivals/hellfest");
  });
});

describe("selectPresentedEdition", () => {
  test("présente l'édition à venir", () => {
    const past = edition({ id: "e0", year: 2025, startDate: "2025-06-19", endDate: "2025-06-22" });
    const next = edition();
    assert.deepEqual(selectPresentedEdition([past, next], new Set(["e1"])), { kind: "upcoming", edition: next });
  });

  test("présente la plus proche de plusieurs éditions à venir (ADR 0019)", () => {
    const later = edition({ id: "e2", year: 2028, startDate: "2028-06-15", endDate: null });
    const sooner = edition({ id: "e1", year: 2027, startDate: null, endDate: null });
    const presented = selectPresentedEdition([later, sooner], new Set(["e1", "e2"]));
    assert.equal(presented.edition.id, "e1");
  });

  test("présente une édition à venir sans date", () => {
    const undated = edition({ startDate: null, endDate: null });
    assert.equal(selectPresentedEdition([undated], new Set(["e1"])).kind, "upcoming");
  });

  test("à défaut d'édition à venir, présente la dernière édition passée", () => {
    const older = edition({ id: "e0", year: 2024, startDate: "2024-06-20", endDate: null });
    const last = edition({ id: "e1", year: 2025, startDate: "2025-06-19", endDate: null });
    assert.deepEqual(selectPresentedEdition([last, older], new Set()), { kind: "past", edition: last });
  });

  test("sans édition, n'en présente aucune", () => {
    assert.deepEqual(selectPresentedEdition([], new Set()), { kind: "none", edition: null });
  });
});

describe("mergeSources", () => {
  test("garde une ligne par URL, avec la consultation la plus récente", () => {
    const merged = mergeSources([
      source({ consultedOn: "2026-09-01" }),
      source({ festivalId: null, editionId: "e1", consultedOn: "2026-10-05" }),
    ]);
    assert.deepEqual(merged, [{ url: "https://granit-open-air.example/", kind: "official", consultedOn: "2026-10-05" }]);
  });

  test("garde une consultation plus ancienne si elle vient en second", () => {
    const merged = mergeSources([source({ consultedOn: "2026-10-05" }), source({ consultedOn: "2026-09-01" })]);
    assert.equal(merged[0].consultedOn, "2026-10-05");
  });

  test("garde des URL différentes dans leur ordre d'arrivée", () => {
    const merged = mergeSources([
      source({ url: "https://a.example/" }),
      source({ url: "https://b.example/", kind: "ticketing" }),
    ]);
    assert.deepEqual(
      merged.map((s) => [s.url, s.kind]),
      [
        ["https://a.example/", "official"],
        ["https://b.example/", "ticketing"],
      ],
    );
  });
});

describe("latestRevision", () => {
  test("prend la plus récente des deux dates", () => {
    assert.equal(latestRevision("2026-10-01T08:00:00+00:00", "2026-10-12T22:30:00+00:00"), "2026-10-12");
    assert.equal(latestRevision("2026-10-12T22:30:00+00:00", "2026-10-01T08:00:00+00:00"), "2026-10-12");
  });

  test("se contente de la date du festival sans édition", () => {
    assert.equal(latestRevision("2026-10-01T08:00:00+00:00", null), "2026-10-01");
    assert.equal(latestRevision("2026-10-01T08:00:00+00:00", undefined), "2026-10-01");
  });

  test("ramène l'horodatage au jour UTC", () => {
    assert.equal(latestRevision("2026-10-01T23:30:00-02:00", null), "2026-10-02");
  });
});

describe("buildFestivalSheets", () => {
  test("assemble chaque fiche avec l'édition présentée et ses sources seulement", () => {
    const f1 = festival();
    const f2 = festival({ id: "f2", name: "Cendres Fest", slug: "cendres-fest", website: null });
    const past = edition({ id: "e0", year: 2025, startDate: "2025-06-19", endDate: null, revisedAt: "2026-10-09T00:00:00+00:00" });
    const next = edition({ revisedAt: "2026-10-12T00:00:00+00:00" });

    const sheets = buildFestivalSheets(
      [f1, f2],
      [past, next],
      ["e1"],
      [
        source(),
        source({ festivalId: null, editionId: "e1", url: "https://tickets.example/granit", kind: "ticketing" }),
        source({ festivalId: null, editionId: "e0", url: "https://granit-open-air.example/2025" }),
        source({ festivalId: "f2", url: "https://cendres.example/" }),
      ],
    );

    // Triées par slug
    assert.deepEqual(sheets.map((s) => s.festival.slug), ["cendres-fest", "granit-open-air"]);

    const [cendres, granit] = sheets;
    assert.deepEqual(cendres.presented, { kind: "none", edition: null });
    assert.deepEqual(cendres.sources.map((s) => s.url), ["https://cendres.example/"]);
    assert.equal(cendres.revisedOn, "2026-10-01");

    assert.equal(granit.presented.edition.id, "e1");
    // Les sources de l'édition passée, non présentée, sont écartées
    assert.deepEqual(granit.sources.map((s) => s.url), [
      "https://granit-open-air.example/",
      "https://tickets.example/granit",
    ]);
    assert.equal(granit.revisedOn, "2026-10-12");
  });

  test("place les sources du festival avant celles de l'édition, quel que soit l'ordre lu", () => {
    const [sheet] = buildFestivalSheets(
      [festival()],
      [edition()],
      ["e1"],
      [
        source({ festivalId: null, editionId: "e1", url: "https://e.example/" }),
        source({ url: "https://f.example/" }),
      ],
    );
    assert.deepEqual(sheet.sources.map((s) => s.url), ["https://f.example/", "https://e.example/"]);
  });

  test("liste les sources de la dernière édition passée quand c'est elle qui est présentée", () => {
    const past = edition({ year: 2025, startDate: "2025-06-19", endDate: null });
    const [sheet] = buildFestivalSheets(
      [festival()],
      [past],
      [],
      [source(), source({ festivalId: null, editionId: "e1", url: "https://granit-open-air.example/2025" })],
    );
    assert.equal(sheet.presented.kind, "past");
    assert.equal(sheet.sources.length, 2);
  });
});

describe("buildMusicEventJsonLd", () => {
  const sheetWith = (editionOverrides, kind = "upcoming") => ({
    festival: festival(),
    presented: { kind, edition: edition(editionOverrides) },
  });

  test("décrit une édition à venir au lieu complet", () => {
    assert.deepEqual(buildMusicEventJsonLd(sheetWith({}), PAGE_URL), {
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      name: "Granit Open Air 2027",
      url: PAGE_URL,
      startDate: "2027-06-17",
      endDate: "2027-06-20",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: "Výstaviště",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Brno",
          postalCode: "603 00",
          addressRegion: "Jihomoravský kraj",
          addressCountry: "CZ",
        },
      },
    });
  });

  test("omet les champs absents : un seul jour, lieu partiel", () => {
    const jsonLd = buildMusicEventJsonLd(
      sheetWith({ endDate: null, venueName: null, postcode: null, region: null, city: "Leipzig", countryCode: "DE" }),
      PAGE_URL,
    );
    assert.equal("endDate" in jsonLd, false);
    assert.deepEqual(jsonLd.location, {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: "Leipzig", addressCountry: "DE" },
    });
  });

  test("garde le pays seul sans ville", () => {
    const jsonLd = buildMusicEventJsonLd(
      sheetWith({ venueName: null, city: null, postcode: null, region: null, countryCode: "ES" }),
      PAGE_URL,
    );
    assert.deepEqual(jsonLd.location.address, { "@type": "PostalAddress", addressCountry: "ES" });
  });

  test("ne publie aucun Event sans date de début", () => {
    assert.equal(buildMusicEventJsonLd(sheetWith({ startDate: null, endDate: null }), PAGE_URL), null);
  });

  test("ne publie aucun Event pour une édition passée ni sans édition", () => {
    assert.equal(buildMusicEventJsonLd(sheetWith({}, "past"), PAGE_URL), null);
    assert.equal(
      buildMusicEventJsonLd({ festival: festival(), presented: { kind: "none", edition: null } }, PAGE_URL),
      null,
    );
  });

  test("ne porte ni performer ni offers", () => {
    const jsonLd = buildMusicEventJsonLd(sheetWith({}), PAGE_URL);
    assert.equal("performer" in jsonLd, false);
    assert.equal("offers" in jsonLd, false);
  });
});

describe("displayUrl", () => {
  test("retire le protocole et la barre finale", () => {
    assert.equal(displayUrl("https://hellfest.fr/"), "hellfest.fr");
    assert.equal(displayUrl("http://www.effenaar.nl/agenda"), "www.effenaar.nl/agenda");
  });
});

describe("festivalSheetView", () => {
  const sheet = {
    festival: festival({ subgenres: ["NWOBHM"] }),
    presented: { kind: "upcoming", edition: edition() },
    sources: [{ url: "https://granit-open-air.example/", kind: "official", consultedOn: "2026-10-01" }],
    revisedOn: "2026-10-12",
  };

  test("formate la fiche avec les formats de la liste, dans la langue de la page", () => {
    const view = festivalSheetView(sheet, "fr", PAGE_URL);
    assert.equal(view.genre, "Heavy metal");
    assert.deepEqual(view.subgenres, ["NWOBHM"]);
    assert.deepEqual({ ...view.edition, dates: plain(view.edition.dates) }, {
      year: 2027,
      dates: "17–20 juin 2027",
      venue: "Výstaviště",
      location: "Brno, Tchéquie",
    });
    assert.deepEqual(view.sources, [
      {
        kind: "official",
        url: "https://granit-open-air.example/",
        label: "granit-open-air.example",
        consultedOn: "1er octobre 2026",
      },
    ]);
    assert.equal(view.revisedOn, "12 octobre 2026");
    assert.deepEqual(JSON.parse(view.jsonLd).name, "Granit Open Air 2027");
  });

  test("traduit genre, pays et dates en anglais", () => {
    const view = festivalSheetView(sheet, "en", PAGE_URL);
    assert.equal(view.genre, "Heavy Metal");
    assert.equal(view.edition.location, "Brno, Czechia");
    assert.equal(plain(view.edition.dates), "17 – 20 June 2027");
    assert.equal(view.sources[0].consultedOn, "1 October 2026");
  });

  test("laisse les dates à null pour une édition sans date, sans JSON-LD", () => {
    const view = festivalSheetView(
      { ...sheet, presented: { kind: "upcoming", edition: edition({ startDate: null, endDate: null }) } },
      "fr",
      PAGE_URL,
    );
    assert.equal(view.edition.dates, null);
    assert.equal(view.jsonLd, null);
  });

  test("sans édition, ni édition ni JSON-LD", () => {
    const view = festivalSheetView({ ...sheet, presented: { kind: "none", edition: null } }, "fr", PAGE_URL);
    assert.equal(view.editionKind, "none");
    assert.equal(view.edition, null);
    assert.equal(view.jsonLd, null);
  });
});

describe("serializeJsonLd", () => {
  test("échappe < pour qu'aucune donnée ne ferme la balise script", () => {
    const json = serializeJsonLd({ name: "Fest </script><script>alert(1)</script>" });
    assert.doesNotMatch(json, /</);
    assert.deepEqual(JSON.parse(json), { name: "Fest </script><script>alert(1)</script>" });
  });
});

describe("fetchFestivalSheets", () => {
  // Faux client : une réponse par table, chaque requête notée dans `calls`
  function fakeClient(tables) {
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
          order() {
            return this;
          },
          range() {
            calls.push(query);
            return Promise.resolve(tables[table]);
          },
        };
      },
    };
  }

  const rows = {
    festivals: {
      data: [
        {
          id: "f1",
          name: "Granit Open Air",
          slug: "granit-open-air",
          website: null,
          subgenres: ["NWOBHM"],
          revised_at: "2026-10-01T08:00:00+00:00",
          genre: { label_fr: "Heavy metal", label_en: "Heavy Metal" },
        },
      ],
      error: null,
    },
    editions: {
      data: [
        {
          id: "e1",
          festival_id: "f1",
          year: 2027,
          start_date: "2027-06-17",
          end_date: null,
          venue_name: null,
          city: "Brno",
          postcode: null,
          region: null,
          country_code: "CZ",
          revised_at: "2026-10-02T08:00:00+00:00",
        },
      ],
      error: null,
    },
    upcoming_editions: { data: [{ id: "e1" }], error: null },
    sources: {
      data: [{ id: "s1", festival_id: "f1", edition_id: null, url: "https://g.example/", kind: "official", consulted_on: "2026-10-01" }],
      error: null,
    },
  };

  test("lit les quatre tables, sans `*` ni submitted_by", async () => {
    const client = fakeClient(rows);
    await fetchFestivalSheets(client);
    assert.deepEqual(client.calls.map((c) => c.table).sort(), ["editions", "festivals", "sources", "upcoming_editions"]);
    for (const call of client.calls) {
      assert.doesNotMatch(call.columns, /\*|submitted_by/, call.table);
    }
  });

  test("met les lignes à la forme attendue par la fiche", async () => {
    const [sheet] = await fetchFestivalSheets(fakeClient(rows));
    assert.equal(sheet.festival.slug, "granit-open-air");
    assert.deepEqual(sheet.festival.subgenres, ["NWOBHM"]);
    assert.deepEqual(sheet.festival.genreLabels, { fr: "Heavy metal", en: "Heavy Metal" });
    assert.equal(sheet.presented.kind, "upcoming");
    assert.equal(sheet.presented.edition.city, "Brno");
    assert.deepEqual(sheet.sources, [{ url: "https://g.example/", kind: "official", consultedOn: "2026-10-01" }]);
    assert.equal(sheet.revisedOn, "2026-10-02");
  });

  test("échoue si une des lectures échoue", async () => {
    const client = fakeClient({ ...rows, sources: { data: null, error: { message: "timeout" } } });
    await assert.rejects(fetchFestivalSheets(client), /Lecture de sources impossible : timeout/);
  });
});
