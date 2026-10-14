import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { interpolate } from "./interpolate.js";

describe("interpolate", () => {
  test("renvoie tel quel un libellé sans paramètre", () => {
    assert.equal(interpolate("Sources"), "Sources");
  });

  test("remplace chaque paramètre, même répété", () => {
    assert.equal(
      interpolate("{name} : prochaine édition {year}, {name}", { name: "Hellfest", year: 2027 }),
      "Hellfest : prochaine édition 2027, Hellfest",
    );
  });

  test("refuse un paramètre sans valeur", () => {
    assert.throws(() => interpolate("Dernière révision : {date}", {}), /Paramètre manquant : \{date\}/);
  });
});
