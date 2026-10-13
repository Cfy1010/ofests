import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { locales, toLocale } from "./locales.js";

describe("toLocale", () => {
  test("renvoie telles quelles les langues du site", () => {
    assert.equal(toLocale("fr"), "fr");
    assert.equal(toLocale("en"), "en");
  });

  test("accepte chacune des langues déclarées", () => {
    for (const locale of locales) {
      assert.equal(toLocale(locale), locale);
    }
  });

  test("refuse une page sans langue", () => {
    assert.throws(() => toLocale(undefined), /Langue de page inconnue : undefined/);
  });

  test("refuse une langue inconnue", () => {
    assert.throws(() => toLocale("de"), /Langue de page inconnue : de/);
  });
});
