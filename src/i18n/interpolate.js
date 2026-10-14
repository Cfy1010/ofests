// Remplace les paramètres {nom} d'un libellé. Module sans import, testé par
// `node --test`. Un paramètre sans valeur fait échouer le build : aucun
// « {name} » ne part en ligne.

/**
 * @param {string} template
 * @param {Record<string, string | number>} [values]
 * @returns {string}
 */
export function interpolate(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    if (!Object.hasOwn(values, name)) {
      throw new Error(`Paramètre manquant : {${name}} dans « ${template} »`);
    }
    return String(values[name]);
  });
}
