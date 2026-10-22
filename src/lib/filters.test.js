import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  availableCountries,
  filterEditions,
  parseCountryParam,
  serializeCountryParam,
  summarizeCountries,
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

describe("serializeCountryParam", () => {
  test("ajoute le paramètre, codes en majuscules, sans encoder la virgule", () => {
    assert.equal(serializeCountryParam("", ["FR", "BE"]), "?country=FR,BE");
  });

  test("une sélection vide retire le paramètre", () => {
    assert.equal(serializeCountryParam("?country=FR", []), "");
  });

  test("conserve les autres paramètres", () => {
    assert.equal(serializeCountryParam("?x=1&country=FR", ["DE"]), "?x=1&country=DE");
    assert.equal(serializeCountryParam("?x=1&country=FR", []), "?x=1");
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

describe("summarizeCountries", () => {
  const countries = [
    { code: "FI", label: "Finlande" },
    { code: "FR", label: "France" },
    { code: "NO", label: "Norvège" },
    { code: "NL", label: "Pays-Bas" },
  ];

  test("aucun pays choisi : rien à résumer", () => {
    assert.deepEqual(summarizeCountries(countries, []), { labels: [], more: 0 });
  });

  test("un ou deux pays : leurs noms, sans reste", () => {
    assert.deepEqual(summarizeCountries(countries, ["FI"]), { labels: ["Finlande"], more: 0 });
    assert.deepEqual(summarizeCountries(countries, ["FR", "FI"]), {
      labels: ["Finlande", "France"],
      more: 0,
    });
  });

  test("au-delà de deux : les deux premiers de la liste et le reste", () => {
    assert.deepEqual(summarizeCountries(countries, ["NL", "FR", "FI"]), {
      labels: ["Finlande", "France"],
      more: 1,
    });
    assert.equal(summarizeCountries(countries, ["FI", "FR", "NO", "NL"]).more, 2);
  });

  test("ignore les codes absents de la liste", () => {
    assert.deepEqual(summarizeCountries(countries, ["XX"]), { labels: [], more: 0 });
  });
});
