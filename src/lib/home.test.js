import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { HOME_PATH, isHomePath } from "./home.js";

describe("HOME_PATH", () => {
  test("n'est jamais la racine, qui redirige vers l'anglais", () => {
    assert.notEqual(HOME_PATH.replace(/\//g, ""), "");
  });

  test("est la liste des festivals à venir tant qu'il n'y a pas d'accueil dédié", () => {
    assert.equal(HOME_PATH, "festivals");
  });
});

describe("isHomePath", () => {
  test("reconnaît le chemin passé par les pages", () => {
    assert.equal(isHomePath("festivals"), true);
  });

  test("ne dépend pas des barres obliques", () => {
    for (const path of ["/festivals", "festivals/", "/festivals/", "//festivals//"]) {
      assert.equal(isHomePath(path), true, path);
    }
  });

  test("refuse les autres pages", () => {
    for (const path of ["", "/", undefined, "festival", "festivals/hellfest", "fr/festivals"]) {
      assert.equal(isHomePath(path), false, String(path));
    }
  });
});
