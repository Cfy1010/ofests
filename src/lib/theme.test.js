import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  applyTheme,
  DEFAULT_THEME,
  parseTheme,
  readTheme,
  THEME_STORAGE_KEY,
  themes,
  writeTheme,
} from "./theme.js";

// Faux stockage en mémoire, à l'interface de localStorage
function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    values,
  };
}

// Stockage bloqué : chaque appel lève, comme en navigation privée stricte
const blockedStorage = {
  getItem() {
    throw new Error("SecurityError");
  },
  setItem() {
    throw new Error("QuotaExceededError");
  },
};

// Accès au stockage lui-même refusé (window.localStorage lève)
const forbidden = () => {
  throw new Error("SecurityError");
};

describe("parseTheme", () => {
  test("le thème par défaut est le sombre (ADR 0021)", () => {
    assert.equal(DEFAULT_THEME, "dark");
  });

  test("accepte les trois thèmes, dans l'ordre Clair / Sombre / Système", () => {
    assert.deepEqual(themes, ["light", "dark", "system"]);
    for (const theme of themes) {
      assert.equal(parseTheme(theme), theme);
    }
  });

  test("ramène toute autre valeur au sombre", () => {
    for (const value of [null, undefined, "", "Light", "auto", 1, {}]) {
      assert.equal(parseTheme(value), "dark");
    }
  });
});

describe("readTheme", () => {
  test("renvoie le sombre sans choix mémorisé", () => {
    assert.equal(readTheme(() => memoryStorage()), "dark");
  });

  test("renvoie le choix mémorisé", () => {
    for (const theme of themes) {
      const storage = memoryStorage({ [THEME_STORAGE_KEY]: theme });
      assert.equal(readTheme(() => storage), theme);
    }
  });

  test("renvoie le sombre pour une valeur mémorisée invalide", () => {
    const storage = memoryStorage({ [THEME_STORAGE_KEY]: "sepia" });
    assert.equal(readTheme(() => storage), "dark");
  });

  test("renvoie le sombre sans lever si le stockage est bloqué", () => {
    assert.equal(readTheme(() => blockedStorage), "dark");
    assert.equal(readTheme(forbidden), "dark");
  });
});

describe("writeTheme", () => {
  test("mémorise chacun des trois choix, Système compris", () => {
    for (const theme of themes) {
      const storage = memoryStorage();
      assert.equal(writeTheme(() => storage, theme), true);
      assert.equal(storage.values.get(THEME_STORAGE_KEY), theme);
    }
  });

  test("mémorise le sombre à la place d'une valeur invalide", () => {
    const storage = memoryStorage();
    writeTheme(() => storage, "sepia");
    assert.equal(storage.values.get(THEME_STORAGE_KEY), "dark");
  });

  test("renvoie false sans lever si le stockage est bloqué", () => {
    assert.equal(writeTheme(() => blockedStorage, "light"), false);
    assert.equal(writeTheme(forbidden, "light"), false);
  });
});

describe("applyTheme", () => {
  test("pose le thème sur la racine et le renvoie", () => {
    const root = { dataset: {} };
    assert.equal(applyTheme(root, "light"), "light");
    assert.equal(root.dataset.theme, "light");
  });

  test("pose le sombre pour une valeur invalide", () => {
    const root = { dataset: { theme: "light" } };
    assert.equal(applyTheme(root, "sepia"), "dark");
    assert.equal(root.dataset.theme, "dark");
  });
});
