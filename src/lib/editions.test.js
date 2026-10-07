import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { formatDateRange, formatLocation, sortUpcomingEditions } from "./editions.js";

let nextId = 0;

function edition(festivalName, year, startDate = null, id = `id-${nextId++}`) {
  return { id, festivalName, year, startDate };
}

function names(editions) {
  return editions.map((e) => `${e.festivalName} ${e.year}`);
}

// Intl sépare les éléments d'une plage par des espaces fines, qui varient
// selon la version d'ICU : on les ramène à des espaces simples.
function plain(text) {
  return text.replace(/\s/gu, " ");
}

describe("sortUpcomingEditions (ADR 0019)", () => {
  test("trie par année, puis par date de début", () => {
    const sorted = sortUpcomingEditions([
      edition("C", 2028, "2028-06-09"),
      edition("B", 2027, "2027-12-04"),
      edition("A", 2027, "2027-06-18"),
      edition("D", 2026, "2026-10-17"),
    ]);

    assert.deepEqual(names(sorted), ["D 2026", "A 2027", "B 2027", "C 2028"]);
  });

  test("place une édition sans date après les éditions datées de son année", () => {
    const sorted = sortUpcomingEditions([
      edition("Sans date", 2027),
      edition("Décembre", 2027, "2027-12-04"),
      edition("Juin", 2027, "2027-06-18"),
    ]);

    assert.deepEqual(names(sorted), ["Juin 2027", "Décembre 2027", "Sans date 2027"]);
  });

  test("place une édition sans date avant les éditions de l'année suivante", () => {
    const sorted = sortUpcomingEditions([
      edition("Datée", 2028, "2028-06-09"),
      edition("Sans date", 2027),
    ]);

    assert.deepEqual(names(sorted), ["Sans date 2027", "Datée 2028"]);
  });

  test("départage par le nom les éditions qui commencent le même jour", () => {
    const sorted = sortUpcomingEditions([
      edition("Zénith Noir Open Air", 2027, "2027-06-18"),
      edition("Fjordblast", 2027, "2027-06-18"),
      edition("Écho des Tourbières", 2027, "2027-06-18"),
    ]);

    assert.deepEqual(names(sorted), [
      "Écho des Tourbières 2027",
      "Fjordblast 2027",
      "Zénith Noir Open Air 2027",
    ]);
  });

  test("départage par le nom les éditions sans date d'une même année", () => {
    const sorted = sortUpcomingEditions([
      edition("Étoile Polaire Metal Fest", 2027),
      edition("Cendres Fest", 2027),
    ]);

    assert.deepEqual(names(sorted), ["Cendres Fest 2027", "Étoile Polaire Metal Fest 2027"]);
  });

  test("ignore la casse et les accents avant de départager", () => {
    const sorted = sortUpcomingEditions([
      edition("fjordblast", 2027),
      edition("Étoile", 2027),
      edition("eclipse", 2027),
    ]);

    assert.deepEqual(names(sorted), ["eclipse 2027", "Étoile 2027", "fjordblast 2027"]);
  });

  test("classe les nombres d'un nom par leur valeur", () => {
    const sorted = sortUpcomingEditions([
      edition("Metal Days 10", 2027, "2027-06-18"),
      edition("Metal Days 2", 2027, "2027-06-18"),
    ]);

    assert.deepEqual(names(sorted), ["Metal Days 2 2027", "Metal Days 10 2027"]);
  });

  test("donne le même ordre quel que soit l'ordre d'entrée", () => {
    const a = edition("Homonyme", 2027, "2027-06-18", "a");
    const b = edition("Homonyme", 2027, "2027-06-18", "b");

    assert.deepEqual(sortUpcomingEditions([a, b]), [a, b]);
    assert.deepEqual(sortUpcomingEditions([b, a]), [a, b]);
  });

  test("ne modifie pas le tableau reçu", () => {
    const input = [edition("B", 2028), edition("A", 2027)];
    const copy = [...input];

    sortUpcomingEditions(input);

    assert.deepEqual(input, copy);
  });

  test("accepte une liste vide", () => {
    assert.deepEqual(sortUpcomingEditions([]), []);
  });
});

describe("formatDateRange", () => {
  test("formate une plage dans le même mois", () => {
    assert.equal(plain(formatDateRange("2026-10-06", "2026-10-08", "fr")), "6–8 octobre 2026");
    assert.equal(plain(formatDateRange("2026-10-06", "2026-10-08", "en")), "6 – 8 October 2026");
  });

  test("formate une plage à cheval sur deux mois", () => {
    assert.equal(plain(formatDateRange("2027-06-30", "2027-07-02", "fr")), "30 juin – 2 juillet 2027");
    assert.equal(plain(formatDateRange("2027-06-30", "2027-07-02", "en")), "30 June – 2 July 2027");
  });

  test("formate une plage à cheval sur deux années", () => {
    assert.equal(
      plain(formatDateRange("2026-12-30", "2027-01-02", "fr")),
      "30 décembre 2026 – 2 janvier 2027",
    );
    assert.equal(
      plain(formatDateRange("2026-12-30", "2027-01-02", "en")),
      "30 December 2026 – 2 January 2027",
    );
  });

  test("formate un seul jour quand la date de fin manque", () => {
    assert.equal(formatDateRange("2026-11-06", null, "fr"), "6 novembre 2026");
    assert.equal(formatDateRange("2026-11-06", null, "en"), "6 November 2026");
  });

  test("formate un seul jour quand la fin est le jour du début", () => {
    assert.equal(formatDateRange("2026-11-06", "2026-11-06", "fr"), "6 novembre 2026");
  });

  test("écrit « 1er » en français pour le premier jour du mois", () => {
    assert.equal(formatDateRange("2027-03-01", null, "fr"), "1er mars 2027");
    assert.equal(plain(formatDateRange("2027-03-01", "2027-03-03", "fr")), "1er–3 mars 2027");
    assert.equal(
      plain(formatDateRange("2027-06-30", "2027-07-01", "fr")),
      "30 juin – 1er juillet 2027",
    );
  });

  test("n'écrit « 1er » que pour le 1, pas pour le 11, le 21 ou le 31", () => {
    assert.equal(formatDateRange("2027-03-11", null, "fr"), "11 mars 2027");
    assert.equal(plain(formatDateRange("2027-03-21", "2027-03-31", "fr")), "21–31 mars 2027");
  });

  test("garde « 1 » en anglais pour le premier jour du mois", () => {
    assert.equal(formatDateRange("2027-03-01", null, "en"), "1 March 2027");
    assert.equal(plain(formatDateRange("2027-03-01", "2027-03-03", "en")), "1 – 3 March 2027");
  });

  test("renvoie null pour une édition sans date", () => {
    assert.equal(formatDateRange(null, null, "fr"), null);
  });

  test("refuse une langue inconnue", () => {
    assert.throws(() => formatDateRange("2026-11-06", null, "de"), /Langue inconnue : de/);
  });
});

describe("formatLocation", () => {
  test("affiche la ville et le pays dans la langue demandée", () => {
    assert.equal(formatLocation("Brno", "CZ", "fr"), "Brno, Tchéquie");
    assert.equal(formatLocation("Brno", "CZ", "en"), "Brno, Czechia");
    assert.equal(formatLocation("Utrecht", "NL", "fr"), "Utrecht, Pays-Bas");
    assert.equal(formatLocation("Utrecht", "NL", "en"), "Utrecht, Netherlands");
  });

  test("affiche le pays seul quand la ville est absente", () => {
    assert.equal(formatLocation(null, "ES", "fr"), "Espagne");
    assert.equal(formatLocation(null, "ES", "en"), "Spain");
  });

  test("refuse une langue inconnue", () => {
    assert.throws(() => formatLocation("Brno", "CZ", "de"), /Langue inconnue : de/);
  });
});
