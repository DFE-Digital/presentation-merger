/**
 * Replace images in content with references in the manifest from previous path locations
 * 
 * @param {object} data the content which needs any image references replacing
 * @param {array} manifest manifest of files that are included in the document, with previous paths for lookup and replacement
 * 
 * @returns {object} modified input data with any reference replaced within.
 */
export function moveImageReferences(data, manifest=[]) {
  let str = JSON.stringify(data);
  manifest.forEach(i => {
    str = str.replace(new RegExp(i.pathPrevious, 'gi'), i.path);
  });

  return JSON.parse(str);
}

/**
 * Extract XML namespaces from the JSON representation of XML
 * 
 * @param {object} data the JSON representation of XML
 * 
 * @returns {object} XML namespace keys pairs 
 */
export function namespaces(data) {
  let out = {};
  for (let [key, value] of Object.entries(data)) {
    if (key.startsWith('xmlns:')) {
      out[key] = value;
    }
  }
  return out;
}