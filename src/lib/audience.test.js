import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { AUDIENCE_STORAGE_KEY, readAudienceOptOut, writeAudienceOptOut } from "./audience.js";

// Faux stockage en mémoire, à l'interface de localStorage
function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
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
  removeItem() {
    throw new Error("SecurityError");
  },
};

// Accès au stockage lui-même refusé (window.localStorage lève)
const forbidden = () => {
  throw new Error("SecurityError");
};

describe("readAudienceOptOut", () => {
  test("sans choix mémorisé, le visiteur n'est pas opposé", () => {
    assert.equal(readAudienceOptOut(() => memoryStorage()), false);
  });

  test("lit l'opposition mémorisée", () => {
    assert.equal(readAudienceOptOut(() => memoryStorage({ [AUDIENCE_STORAGE_KEY]: "off" })), true);
  });

  test("une valeur inconnue n'est pas une opposition", () => {
    assert.equal(readAudienceOptOut(() => memoryStorage({ [AUDIENCE_STORAGE_KEY]: "oui" })), false);
  });

  test("ne lève jamais : stockage bloqué ou inaccessible, pas d'opposition", () => {
    assert.equal(readAudienceOptOut(() => blockedStorage), false);
    assert.equal(readAudienceOptOut(forbidden), false);
  });
});

describe("writeAudienceOptOut", () => {
  test("mémorise l'opposition", () => {
    const storage = memoryStorage();
    assert.equal(writeAudienceOptOut(() => storage, true), true);
    assert.equal(storage.values.get(AUDIENCE_STORAGE_KEY), "off");
  });

  test("réactiver la mesure supprime la clé : aucun résidu", () => {
    const storage = memoryStorage({ [AUDIENCE_STORAGE_KEY]: "off" });
    assert.equal(writeAudienceOptOut(() => storage, false), true);
    assert.equal(storage.values.has(AUDIENCE_STORAGE_KEY), false);
  });

  test("aller-retour : opposition, lecture, réactivation, lecture", () => {
    const storage = memoryStorage();
    writeAudienceOptOut(() => storage, true);
    assert.equal(readAudienceOptOut(() => storage), true);
    writeAudienceOptOut(() => storage, false);
    assert.equal(readAudienceOptOut(() => storage), false);
  });

  test("ne lève jamais et renvoie false si le stockage est indisponible", () => {
    assert.equal(writeAudienceOptOut(() => blockedStorage, true), false);
    assert.equal(writeAudienceOptOut(() => blockedStorage, false), false);
    assert.equal(writeAudienceOptOut(forbidden, true), false);
  });
});
