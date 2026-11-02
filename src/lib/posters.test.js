import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { describe, test } from "node:test";

import { findPosterProblems, parsePosterFileName, posterFileName } from "./posters.js";

const sheets = [
  { festival: { slug: "motocultor-festival" }, editionYears: [2026, 2027] },
  { festival: { slug: "brutal-assault" }, editionYears: [2026] },
];

describe("posterFileName", () => {
  test("{slug}-{année}.webp", () => {
    assert.equal(posterFileName("motocultor-festival", 2027), "motocultor-festival-2027.webp");
  });
});

describe("parsePosterFileName", () => {
  test("lit le slug et l'année", () => {
    assert.deepEqual(parsePosterFileName("motocultor-festival-2027.webp"), { slug: "motocultor-festival", year: 2027 });
  });

  test("un slug qui contient des chiffres reste entier", () => {
    assert.deepEqual(parsePosterFileName("rock-2000-2027.webp"), { slug: "rock-2000", year: 2027 });
  });

  test("refuse un nom hors convention", () => {
    for (const name of [
      "motocultor-2027.jpg",
      "motocultor.webp",
      "Motocultor-2027.webp",
      "motocultor_festival-2027.webp",
      "motocultor--2027.webp",
      "-2027.webp",
      "motocultor-27.webp",
      "motocultor-2027.webp.webp",
    ]) {
      assert.equal(parsePosterFileName(name), null, name);
    }
  });
});

describe("findPosterProblems", () => {
  test("rien à signaler quand chaque affiche a son édition", () => {
    assert.deepEqual(findPosterProblems(["motocultor-festival-2027.webp", "brutal-assault-2026.webp"], sheets), []);
  });

  test("signale un nom hors convention", () => {
    assert.deepEqual(findPosterProblems(["affiche.webp"], sheets), ["affiche.webp : nom attendu {slug}-{année}.webp"]);
  });

  test("signale un festival inconnu", () => {
    assert.deepEqual(findPosterProblems(["inconnu-2027.webp"], sheets), [
      "inconnu-2027.webp : aucun festival publié « inconnu »",
    ]);
  });

  test("signale une année sans édition visible : pas d'affiche sur la mauvaise édition", () => {
    assert.deepEqual(findPosterProblems(["brutal-assault-2027.webp"], sheets), [
      "brutal-assault-2027.webp : aucune édition 2027 visible pour « brutal-assault »",
    ]);
  });
});

describe("fichiers de src/assets/posters/", () => {
  // La base n'est pas lisible ici : le lien avec les éditions est contrôlé
  // au build (checkPosters). Ce test garde la convention de nommage.
  test("chaque fichier respecte {slug}-{année}.webp", () => {
    // Un dossier sans affiche est un état valide (retrait d'accord) ; git ne
    // garde pas un dossier vide, il peut donc ne pas exister
    const dir = new URL("../assets/posters/", import.meta.url);
    const files = existsSync(dir) ? readdirSync(dir) : [];
    for (const file of files) {
      assert.ok(parsePosterFileName(file), `${file} : nom attendu {slug}-{année}.webp`);
    }
  });
});
