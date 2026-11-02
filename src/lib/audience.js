// Mesure d'audience (#62, ADR 0028) : le visiteur peut s'y opposer depuis la
// page légale, et son choix est mémorisé sur l'appareil, sur le modèle de
// theme.js. Le script de tête de src/layouts/Base.astro recopie
// readAudienceOptOut() à la main : toute modification ici doit y être
// reportée.

export const AUDIENCE_STORAGE_KEY = "ofests-audience";

// Seule l'opposition est mémorisée. Sans clé, la mesure est active.
const OPTED_OUT = "off";

/**
 * Le visiteur s'est-il opposé à la mesure ? Ne lève jamais : un stockage
 * absent ou bloqué donne « pas d'opposition ». L'accès au stockage lui-même
 * peut lever, d'où la fonction getStorage.
 * @param {() => Pick<Storage, "getItem">} getStorage
 * @returns {boolean}
 */
export function readAudienceOptOut(getStorage) {
  try {
    return getStorage().getItem(AUDIENCE_STORAGE_KEY) === OPTED_OUT;
  } catch {
    return false;
  }
}

/**
 * Mémorise l'opposition, ou la supprime : réactiver la mesure retire la clé,
 * rien ne reste dans le navigateur. Ne lève jamais ; renvoie false si le
 * stockage est indisponible (le choix n'est alors pas conservé : la page
 * légale le dit au visiteur).
 * @param {() => Pick<Storage, "setItem" | "removeItem">} getStorage
 * @param {boolean} optedOut
 * @returns {boolean}
 */
export function writeAudienceOptOut(getStorage, optedOut) {
  try {
    const storage = getStorage();
    if (optedOut) {
      storage.setItem(AUDIENCE_STORAGE_KEY, OPTED_OUT);
    } else {
      storage.removeItem(AUDIENCE_STORAGE_KEY);
    }
    return true;
  } catch {
    return false;
  }
}
