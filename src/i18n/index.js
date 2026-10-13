import fr from "./fr.json";
import en from "./en.json";

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

  return function t(key) {
    if (!Object.hasOwn(dictionary, key)) {
      throw new Error(`Libellé manquant : ${key} (${locale})`);
    }
    return dictionary[key];
  };
}
