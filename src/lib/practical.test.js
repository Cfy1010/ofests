import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { buildPractical, formatPrice, practicalView } from "./practical.js";

// Intl met des espaces insécables (fines ou non) dans les montants : on les
// ramène à des espaces simples, comme dans les tests de dates.
function plain(text) {
  return text.replace(/\s/gu, " ");
}

function edition(overrides = {}) {
  return {
    id: "e1",
    priceKind: "unspecified",
    priceAmount: null,
    priceCurrency: null,
    camping: "unspecified",
    accessibility: "unspecified",
    practicalSourceId: null,
    ...overrides,
  };
}

const sources = [
  { id: "s1", festivalId: null, editionId: "e1", url: "https://fest.example/2027", kind: "official", consultedOn: "2026-10-01" },
  { id: "s2", festivalId: null, editionId: "e1", url: "https://fest.example/infos", kind: "official", consultedOn: "2026-11-20" },
];

describe("buildPractical", () => {
  test("par défaut : tout non précisé, sans source", () => {
    assert.deepEqual(buildPractical(edition(), sources), {
      priceKind: "unspecified",
      priceAmount: null,
      priceCurrency: null,
      camping: "unspecified",
      accessibility: "unspecified",
      source: null,
    });
  });

  test("reprend les valeurs et la source désignée, avec sa date de consultation", () => {
    const practical = buildPractical(
      edition({ priceKind: "from", priceAmount: 89, priceCurrency: "EUR", camping: "yes", accessibility: "no", practicalSourceId: "s2" }),
      sources,
    );
    assert.equal(practical.priceKind, "from");
    assert.equal(practical.priceAmount, 89);
    assert.equal(practical.camping, "yes");
    assert.equal(practical.accessibility, "no");
    assert.deepEqual(practical.source, { url: "https://fest.example/infos", kind: "official", consultedOn: "2026-11-20" });
  });

  test("source introuvable parmi les sources lues : pas de source", () => {
    assert.equal(buildPractical(edition({ practicalSourceId: "absente" }), sources).source, null);
  });
});

describe("formatPrice", () => {
  test("montant rond, sans décimales, à la place de la langue", () => {
    assert.equal(plain(formatPrice(89, "EUR", "fr")), "89 €");
    assert.equal(formatPrice(89, "EUR", "en"), "€89");
  });

  test("montant avec centimes : deux décimales", () => {
    assert.equal(plain(formatPrice(89.5, "EUR", "fr")), "89,50 €");
    assert.equal(formatPrice(89.5, "EUR", "en"), "€89.50");
  });

  test("autres devises européennes", () => {
    assert.equal(formatPrice(65, "GBP", "en"), "£65");
    assert.match(plain(formatPrice(1200, "SEK", "fr")), /^1 200 SEK$/);
  });
});

describe("practicalView", () => {
  test("à partir de : montant formaté ; source avec date formatée", () => {
    const view = practicalView(
      {
        priceKind: "from",
        priceAmount: 89,
        priceCurrency: "EUR",
        camping: "yes",
        accessibility: "unspecified",
        source: { url: "https://fest.example/infos", kind: "official", consultedOn: "2026-11-20" },
      },
      "fr",
    );
    assert.deepEqual({ ...view, price: plain(/** @type {string} */ (view.price)) }, {
      priceKind: "from",
      price: "89 €",
      camping: "yes",
      accessibility: "unspecified",
      source: { url: "https://fest.example/infos", consultedOn: "20 novembre 2026" },
    });
  });

  test("gratuit ou non précisé : pas de montant", () => {
    const base = { priceAmount: null, priceCurrency: null, camping: "no", accessibility: "yes", source: null };
    assert.equal(practicalView({ ...base, priceKind: "free" }, "en").price, null);
    assert.equal(practicalView({ ...base, priceKind: "unspecified" }, "en").price, null);
    assert.equal(practicalView({ ...base, priceKind: "free" }, "en").source, null);
  });
});
