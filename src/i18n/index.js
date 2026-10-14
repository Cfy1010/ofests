import fr from "./fr.json";
import en from "./en.json";
import { interpolate } from "./interpolate.js";

export { locales, toLocale } from "./locales.js";

const dictionaries = { fr, en };

// Renvoie la fonction de traduction d'une langue.
// Une langue ou une clé inconnue fait échouer le build : aucun libellé
// manquant ne part en ligne.
export function useTranslations(locale) {
  const dictionary = dictionaries[locale];
  if (!dictionary) {
    throw new Error(`Langue inconnue : ${locale}`);
  }

  // values : paramètres {nom} du libellé (voir interpolate.js)
  return function t(key, values) {
    if (!Object.hasOwn(dictionary, key)) {
      throw new Error(`Libellé manquant : ${key} (${locale})`);
    }
    return interpolate(dictionary[key], values);
  };
}
