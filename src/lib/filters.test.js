import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  availableCountries,
  availableMonths,
  filterEditions,
  flattenGenreOptions,
  genreKeys,
  genreOptions,
  parseCountryParam,
  parseGenreParam,
  parsePeriodParam,
  serializeFilterParams,
  summarizeSelection,
  summarizePeriod,
} from "./filters.js";

const editions = [
  { id: "1", countryCode: "FR" },
  { id: "2", countryCode: "DE" },
  { id: "3", countryCode: "FR" },
  { id: "4", countryCode: "BE" },
  { id: "5", countryCode: "ES" },
];

describe("availableCountries", () => {
  test("ne garde que les pays ayant une édition, sans doublon", () => {
    const codes = availableCountries(editions, "fr").map((c) => c.code);
    assert.deepEqual(codes.toSorted(), ["BE", "DE", "ES", "FR"]);
  });

  test("libellés et tri alphabétique dans la langue de la page", () => {
    assert.deepEqual(availableCountries(editions, "fr"), [
      { code: "DE", label: "Allemagne" },
      { code: "BE", label: "Belgique" },
      { code: "ES", label: "Espagne" },
      { code: "FR", label: "France" },
    ]);
    assert.deepEqual(
      availableCountries(editions, "en").map((c) => c.label),
      ["Belgium", "France", "Germany", "Spain"],
    );
  });

  test("liste vide sans édition", () => {
    assert.deepEqual(availableCountries([], "fr"), []);
  });
});

describe("parseCountryParam", () => {
  const available = ["BE", "DE", "FR"];

  test("lit une liste de codes", () => {
    assert.deepEqual(parseCountryParam("?country=FR,BE", available), ["FR", "BE"]);
  });

  test("accepte la query sans point d'interrogation", () => {
    assert.deepEqual(parseCountryParam("country=FR", available), ["FR"]);
  });

  test("met en majuscules et dédoublonne", () => {
    assert.deepEqual(parseCountryParam("?country=fr,FR,be", available), ["FR", "BE"]);
  });

  test("ignore en silence les codes inconnus ou sans édition à venir", () => {
    assert.deepEqual(parseCountryParam("?country=FR,XX,ES,,%20", available), ["FR"]);
  });

  test("paramètre absent ou vide : aucun pays", () => {
    assert.deepEqual(parseCountryParam("", available), []);
    assert.deepEqual(parseCountryParam("?country=", available), []);
    assert.deepEqual(parseCountryParam("?other=1", available), []);
  });

  test("garde les autres paramètres hors du résultat", () => {
    assert.deepEqual(parseCountryParam("?x=1&country=DE", available), ["DE"]);
  });
});

describe("serializeFilterParams", () => {
  test("ajoute le paramètre, codes en majuscules, sans encoder la virgule", () => {
    assert.equal(serializeFilterParams("", { countries: ["FR", "BE"] }), "?country=FR,BE");
  });

  test("un filtre vide retire son paramètre", () => {
    assert.equal(serializeFilterParams("?country=FR", { countries: [] }), "");
    assert.equal(serializeFilterParams("?from=2027-06&to=2027-08", {}), "");
  });

  test("conserve les autres paramètres", () => {
    assert.equal(serializeFilterParams("?x=1&country=FR", { countries: ["DE"] }), "?x=1&country=DE");
    assert.equal(serializeFilterParams("?x=1&country=FR", {}), "?x=1");
  });

  test("pays et période ensemble, chaque borne facultative", () => {
    assert.equal(
      serializeFilterParams("", { countries: ["FR", "BE"], from: "2027-06", to: "2027-08" }),
      "?country=FR,BE&from=2027-06&to=2027-08",
    );
    assert.equal(serializeFilterParams("?x=1", { from: "2027-06" }), "?x=1&from=2027-06");
    assert.equal(serializeFilterParams("", { to: "2027-08" }), "?to=2027-08");
  });

  test("remplace l'ancienne période", () => {
    assert.equal(serializeFilterParams("?from=2027-01&to=2027-02", { from: "2027-06" }), "?from=2027-06");
  });
});

const dated = [
  { id: "a", countryCode: "FR", year: 2026, startDate: "2026-10-30", endDate: "2026-11-02" },
  { id: "b", countryCode: "DE", year: 2027, startDate: "2027-06-30", endDate: "2027-07-02" },
  { id: "c", countryCode: "FR", year: 2027, startDate: "2027-08-12", endDate: null },
  { id: "d", countryCode: "BE", year: 2027, startDate: null, endDate: null },
  { id: "e", countryCode: "FR", year: 2028, startDate: null, endDate: null },
];
const idsOf = (list) => list.map((e) => e.id);

describe("filterEditions : période", () => {
  test("aucune borne : tout est renvoyé", () => {
    assert.equal(filterEditions(dated, { from: "", to: "" }).length, 5);
  });

  test("édition à cheval sur deux mois : retenue pour chacun des deux", () => {
    assert.deepEqual(idsOf(filterEditions(dated, { from: "2027-06", to: "2027-06" })), ["b", "d"]);
    assert.deepEqual(idsOf(filterEditions(dated, { from: "2027-07", to: "2027-07" })), ["b", "d"]);
    assert.deepEqual(idsOf(filterEditions(dated, { from: "2027-05", to: "2027-05" })), ["d"]);
  });

  test("édition en cours commencée le mois précédant le build", () => {
    // Build en novembre 2026 : « a » a commencé en octobre, finit en novembre
    assert.deepEqual(idsOf(filterEditions(dated, { from: "2026-11", to: "2026-11" })), ["a"]);
    assert.deepEqual(idsOf(filterEditions(dated, { from: "2026-11" })).slice(0, 2), ["a", "b"]);
  });

  test("début seul", () => {
    assert.deepEqual(idsOf(filterEditions(dated, { from: "2027-08" })), ["c", "d", "e"]);
  });

  test("fin seule", () => {
    assert.deepEqual(idsOf(filterEditions(dated, { to: "2026-12" })), ["a"]);
  });

  test("les deux bornes", () => {
    assert.deepEqual(idsOf(filterEditions(dated, { from: "2027-07", to: "2027-08" })), ["b", "c", "d"]);
  });

  test("édition sans date : retenue si son année est dans la plage", () => {
    assert.deepEqual(idsOf(filterEditions(dated, { from: "2027-12", to: "2027-12" })), ["d"]);
    assert.ok(idsOf(filterEditions(dated, { from: "2027-01", to: "2028-01" })).includes("e"));
  });

  test("édition sans date : écartée si son année est hors plage", () => {
    assert.equal(idsOf(filterEditions(dated, { from: "2028-01" })).includes("d"), false);
    assert.equal(idsOf(filterEditions(dated, { to: "2027-12" })).includes("e"), false);
  });

  test("ET avec le filtre pays", () => {
    assert.deepEqual(
      idsOf(filterEditions(dated, { countries: ["FR"], from: "2027-06", to: "2027-08" })),
      ["c"],
    );
    assert.deepEqual(
      idsOf(filterEditions(dated, { countries: ["DE", "BE"], from: "2027-07", to: "2027-07" })),
      ["b", "d"],
    );
    assert.deepEqual(filterEditions(dated, { countries: ["DE"], from: "2027-08" }), []);
  });
});

describe("availableMonths", () => {
  const today = new Date("2026-10-23T12:00:00Z");

  test("mois en continu, du mois du build au dernier mois couvert", () => {
    const editions = [{ year: 2027, startDate: "2027-01-15", endDate: "2027-01-17" }];
    const values = availableMonths(editions, today, "fr").map((m) => m.value);
    assert.deepEqual(values, ["2026-10", "2026-11", "2026-12", "2027-01"]);
  });

  test("un mois sans édition reste proposé", () => {
    const editions = [
      { year: 2026, startDate: "2026-10-30", endDate: "2026-10-31" },
      { year: 2027, startDate: "2027-02-05", endDate: null },
    ];
    const values = availableMonths(editions, today, "fr").map((m) => m.value);
    assert.ok(values.includes("2026-12"));
    assert.equal(values.length, 5);
  });

  test("la fin d'une édition à cheval compte", () => {
    const editions = [{ year: 2026, startDate: "2026-12-30", endDate: "2027-01-02" }];
    assert.equal(availableMonths(editions, today, "fr").at(-1).value, "2027-01");
  });

  test("édition sans date : jusqu'à décembre de son année", () => {
    const editions = [{ year: 2028, startDate: null, endDate: null }];
    const months = availableMonths(editions, today, "fr");
    assert.equal(months.at(-1).value, "2028-12");
    assert.equal(months.length, 27);
  });

  test("passage d'année sans trou", () => {
    const editions = [{ year: 2027, startDate: null, endDate: null }];
    const values = availableMonths(editions, new Date("2026-11-30T23:59:59Z"), "fr").map((m) => m.value);
    assert.deepEqual(values.slice(0, 3), ["2026-11", "2026-12", "2027-01"]);
    assert.equal(new Set(values).size, values.length);
  });

  test("le mois du build est lu en UTC", () => {
    const editions = [{ year: 2026, startDate: null, endDate: null }];
    const months = availableMonths(editions, new Date("2026-10-31T23:30:00Z"), "fr");
    assert.equal(months[0].value, "2026-10");
  });

  test("libellés dans la langue de la page", () => {
    const editions = [{ year: 2026, startDate: null, endDate: null }];
    assert.deepEqual(availableMonths(editions, today, "fr")[0], {
      value: "2026-10",
      label: "octobre 2026",
      monthLabel: "octobre",
    });
    assert.equal(availableMonths(editions, today, "en")[0].label, "October 2026");
  });

  test("aucune édition : aucun mois", () => {
    assert.deepEqual(availableMonths([], today, "fr"), []);
  });
});

describe("parsePeriodParam", () => {
  const available = ["2027-05", "2027-06", "2027-07", "2027-08"];

  test("lit les deux bornes, ou une seule", () => {
    assert.deepEqual(parsePeriodParam("?from=2027-06&to=2027-08", available), { from: "2027-06", to: "2027-08" });
    assert.deepEqual(parsePeriodParam("?from=2027-06", available), { from: "2027-06", to: "" });
    assert.deepEqual(parsePeriodParam("?to=2027-08", available), { from: "", to: "2027-08" });
    assert.deepEqual(parsePeriodParam("", available), { from: "", to: "" });
  });

  test("début > fin : bornes inversées en silence", () => {
    assert.deepEqual(parsePeriodParam("?from=2027-08&to=2027-06", available), { from: "2027-06", to: "2027-08" });
  });

  test("valeur hors liste ignorée", () => {
    assert.deepEqual(parsePeriodParam("?from=2025-01&to=2027-07", available), { from: "", to: "2027-07" });
  });

  test("format invalide ignoré", () => {
    for (const bad of ["2027-6", "2027-13", "juin", "2027-06-01", "2027/06", ""]) {
      assert.deepEqual(parsePeriodParam(`?from=${bad}`, available), { from: "", to: "" }, bad);
    }
  });

  test("coexiste avec le paramètre pays", () => {
    assert.deepEqual(parsePeriodParam("?country=FR&from=2027-06", available), { from: "2027-06", to: "" });
  });
});

describe("summarizePeriod", () => {
  const months = availableMonths(
    [{ year: 2028, startDate: null, endDate: null }],
    new Date("2027-05-10T00:00:00Z"),
    "fr",
  );

  test("aucune borne : pas de résumé", () => {
    assert.equal(summarizePeriod(months, "", ""), null);
  });

  test("deux bornes de la même année : le mois de début sans année", () => {
    assert.deepEqual(summarizePeriod(months, "2027-06", "2027-08"), { kind: "range", text: "juin – août 2027" });
  });

  test("années différentes : les deux années", () => {
    assert.deepEqual(summarizePeriod(months, "2027-06", "2028-01"), {
      kind: "range",
      text: "juin 2027 – janvier 2028",
    });
  });

  test("même mois : un seul mois", () => {
    assert.deepEqual(summarizePeriod(months, "2027-06", "2027-06"), { kind: "range", text: "juin 2027" });
  });

  test("début seul, fin seule", () => {
    assert.deepEqual(summarizePeriod(months, "2027-06", ""), { kind: "from", text: "juin 2027" });
    assert.deepEqual(summarizePeriod(months, "", "2027-08"), { kind: "to", text: "août 2027" });
  });
});

describe("filterEditions", () => {
  test("sans critère ou sélection vide : tout est renvoyé", () => {
    assert.equal(filterEditions(editions, {}).length, 5);
    assert.equal(filterEditions(editions, { countries: [] }).length, 5);
  });

  test("OU entre les pays choisis", () => {
    const ids = filterEditions(editions, { countries: ["FR", "BE"] }).map((e) => e.id);
    assert.deepEqual(ids, ["1", "3", "4"]);
  });

  test("conserve l'ordre d'entrée et ne modifie pas la liste", () => {
    const copy = structuredClone(editions);
    filterEditions(editions, { countries: ["DE"] });
    assert.deepEqual(editions, copy);
  });

  test("un pays sans édition donne une liste vide", () => {
    assert.deepEqual(filterEditions(editions, { countries: ["IT"] }), []);
  });
});

describe("summarizeSelection", () => {
  const countries = [
    { code: "FI", label: "Finlande" },
    { code: "FR", label: "France" },
    { code: "NO", label: "Norvège" },
    { code: "NL", label: "Pays-Bas" },
  ];

  test("aucun pays choisi : rien à résumer", () => {
    assert.deepEqual(summarizeSelection(countries, []), { labels: [], more: 0 });
  });

  test("un ou deux pays : leurs noms, sans reste", () => {
    assert.deepEqual(summarizeSelection(countries, ["FI"]), { labels: ["Finlande"], more: 0 });
    assert.deepEqual(summarizeSelection(countries, ["FR", "FI"]), {
      labels: ["Finlande", "France"],
      more: 0,
    });
  });

  test("au-delà de deux : les deux premiers de la liste et le reste", () => {
    assert.deepEqual(summarizeSelection(countries, ["NL", "FR", "FI"]), {
      labels: ["Finlande", "France"],
      more: 1,
    });
    assert.equal(summarizeSelection(countries, ["FI", "FR", "NO", "NL"]).more, 2);
  });

  test("ignore les codes absents de la liste", () => {
    assert.deepEqual(summarizeSelection(countries, ["XX"]), { labels: [], more: 0 });
  });
});

// Hiérarchie de test : deux tendances à genres, une sans genre, une archivée,
// et all-styles. Libellés qui ne se trient pas pareil en fr et en en.
const genre = (slug, parentSlug, fr, en = fr, archived = false) => ({
  slug,
  parentSlug,
  archived,
  labels: { fr, en },
});
const genres = [
  genre("all-styles", null, "Toutes tendances", "All styles"),
  genre("extreme", null, "Extrême", "Extreme metal"),
  genre("black-metal", "extreme", "Black metal"),
  genre("death-metal", "extreme", "Death metal"),
  genre("thrash-metal", "extreme", "Thrash metal", "Thrash metal", true),
  genre("heavy-classic", null, "Heavy"),
  genre("heavy-metal", "heavy-classic", "Heavy metal"),
  genre("grunge", null, "Grunge"),
  genre("folk", null, "Folk"),
  genre("pagan", "folk", "Pagan"),
  genre("old-trend", null, "Ancienne tendance", "Old trend", true),
  genre("old-genre", "old-trend", "Ancien genre"),
];
const bySlug = (slug) => genres.find((g) => g.slug === slug);

function edition(id, genreSlug, extra = {}) {
  return {
    id,
    countryCode: "FR",
    year: 2027,
    startDate: null,
    endDate: null,
    genreSlug,
    genreParentSlug: bySlug(genreSlug).parentSlug,
    ...extra,
  };
}

const genreEditions = [
  edition("tendance", "extreme"),
  edition("black", "black-metal"),
  edition("death", "death-metal"),
  edition("heavy", "heavy-metal"),
  edition("grunge", "grunge"),
  edition("tout", "all-styles", { countryCode: "DE" }),
  edition("thrash", "thrash-metal"),
  edition("ancien", "old-genre"),
];
const genreOpts = genreOptions(genres, genreEditions, "fr");
const withKeys = genreEditions.map((e) => ({ ...e, genreKeys: genreKeys(e, genreOpts) }));
const retained = (criteria) => idsOf(filterEditions(withKeys, criteria));

describe("genreOptions", () => {
  test("hiérarchie utilisée, tendance puis genres", () => {
    assert.deepEqual(
      genreOpts.map((t) => [t.slug, t.children.map((c) => c.slug)]),
      [
        ["extreme", ["black-metal", "death-metal"]],
        ["grunge", []],
        ["heavy-classic", ["heavy-metal"]],
      ],
    );
  });

  test("tendance sans genre utilisé : proposée si elle-même est utilisée", () => {
    assert.ok(genreOpts.some((t) => t.slug === "grunge" && t.children.length === 0));
  });

  test("tendance dont seul un genre est utilisé : proposée avec ce genre", () => {
    const options = genreOptions(genres, [edition("p", "pagan")], "fr");
    assert.deepEqual(options, [{ slug: "folk", label: "Folk", children: [{ slug: "pagan", label: "Pagan" }] }]);
  });

  test("ni tendance ni genre inutilisé", () => {
    const options = genreOptions(genres, [edition("b", "black-metal")], "fr");
    assert.deepEqual(options[0].children.map((c) => c.slug), ["black-metal"]);
    assert.equal(options.length, 1);
  });

  test("genre archivé exclu des options", () => {
    assert.equal(flattenGenreOptions(genreOpts).some((o) => o.code === "thrash-metal"), false);
  });

  test("genre dont la tendance est archivée : exclu, et sa tendance aussi", () => {
    const codes = flattenGenreOptions(genreOpts).map((o) => o.code);
    assert.equal(codes.includes("old-genre"), false);
    assert.equal(codes.includes("old-trend"), false);
  });

  test("all-styles n'est jamais une option", () => {
    assert.equal(flattenGenreOptions(genreOpts).some((o) => o.code === "all-styles"), false);
  });

  test("tri alphabétique dans la langue de la page", () => {
    const eds = [edition("a", "extreme"), edition("b", "heavy-classic")];
    assert.deepEqual(genreOptions(genres, eds, "fr").map((t) => t.label), ["Extrême", "Heavy"]);
    assert.deepEqual(genreOptions(genres, eds, "en").map((t) => t.label), ["Extreme metal", "Heavy"]);
  });

  test("genres triés à l'intérieur de leur tendance", () => {
    const eds = [edition("a", "death-metal"), edition("b", "black-metal")];
    assert.deepEqual(genreOptions(genres, eds, "fr")[0].children.map((c) => c.label), ["Black metal", "Death metal"]);
  });

  test("aucune édition : aucune option", () => {
    assert.deepEqual(genreOptions(genres, [], "fr"), []);
  });
});

describe("filterEditions : genre", () => {
  test("S vide : le filtre ne filtre pas", () => {
    assert.equal(retained({ genres: [] }).length, withKeys.length);
  });

  test("genre principal dans S", () => {
    assert.deepEqual(retained({ genres: ["black-metal"] }), ["tendance", "black", "tout"]);
  });

  test("genre dont la tendance parente est dans S", () => {
    assert.deepEqual(retained({ genres: ["extreme"] }), ["tendance", "black", "death", "tout", "thrash"]);
  });

  test("tendance parente d'un genre de S : « Extrême » sort pour « Black metal »", () => {
    assert.ok(retained({ genres: ["black-metal"] }).includes("tendance"));
    assert.equal(retained({ genres: ["black-metal"] }).includes("death"), false);
  });

  test("all-styles toujours retenu", () => {
    for (const slug of ["black-metal", "grunge", "heavy-classic"]) {
      assert.ok(retained({ genres: [slug] }).includes("tout"), slug);
    }
  });

  test("all-styles reste filtré par pays et par période", () => {
    assert.equal(retained({ genres: ["grunge"], countries: ["FR"] }).includes("tout"), false);
    assert.ok(retained({ genres: ["grunge"], countries: ["DE"] }).includes("tout"));
    assert.equal(retained({ genres: ["grunge"], from: "2028-01" }).includes("tout"), false);
  });

  test("plusieurs tendances : OU entre elles", () => {
    assert.deepEqual(retained({ genres: ["grunge", "heavy-classic"] }), ["heavy", "grunge", "tout"]);
  });

  test("genre archivé dont la tendance est cochée : retenu", () => {
    assert.ok(retained({ genres: ["extreme"] }).includes("thrash"));
  });

  test("genre archivé : retenu par rien d'autre que sa tendance", () => {
    assert.equal(retained({ genres: ["black-metal"] }).includes("thrash"), false);
  });

  test("genre dont la tendance est archivée : ne sort plus quand un genre est coché", () => {
    assert.equal(retained({ genres: ["extreme"] }).includes("ancien"), false);
    assert.ok(retained({}).includes("ancien"));
  });

  test("ET avec pays et période", () => {
    assert.deepEqual(retained({ genres: ["extreme"], countries: ["DE"] }), ["tout"]);
    assert.deepEqual(retained({ genres: ["heavy-classic"], countries: ["FR"], from: "2027-01" }), ["heavy"]);
  });
});

describe("parseGenreParam", () => {
  test("lit une liste de slugs", () => {
    assert.deepEqual(parseGenreParam("?genre=grunge,black-metal", genreOpts), ["grunge", "black-metal"]);
  });

  test("slug inconnu, archivé ou all-styles ignoré en silence", () => {
    assert.deepEqual(parseGenreParam("?genre=nope,thrash-metal,all-styles,grunge,,", genreOpts), ["grunge"]);
  });

  test("genre redondant avec sa tendance retiré", () => {
    assert.deepEqual(parseGenreParam("?genre=black-metal,extreme", genreOpts), ["extreme"]);
    assert.deepEqual(parseGenreParam("?genre=extreme,black-metal,grunge", genreOpts), ["extreme", "grunge"]);
  });

  test("dédoublonne ; absent ou vide : aucun genre", () => {
    assert.deepEqual(parseGenreParam("?genre=grunge,grunge", genreOpts), ["grunge"]);
    assert.deepEqual(parseGenreParam("", genreOpts), []);
    assert.deepEqual(parseGenreParam("?genre=", genreOpts), []);
  });
});

describe("serializeFilterParams : genre", () => {
  test("genre avec pays et période, autres paramètres conservés", () => {
    assert.equal(
      serializeFilterParams("?x=1&genre=old", { countries: ["FR"], genres: ["extreme", "doom-metal"], from: "2027-06" }),
      "?x=1&country=FR&genre=extreme,doom-metal&from=2027-06",
    );
  });

  test("sans genre, le paramètre disparaît", () => {
    assert.equal(serializeFilterParams("?genre=extreme", { genres: [] }), "");
  });
});
