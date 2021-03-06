import { get } from 'shvl';

/**
 * Replace images in content with references in the manifest from previous path locations
 *
 * @param {object} data The content which needs any image references replacing
 * @param {array} manifest Manifest of files that are included in the document, with previous paths for lookup and replacement
 *
 * @returns {object} Modified input data with any reference replaced within.
 */
export function moveImageReferences(str, manifest = []) {
  manifest.forEach(i => {
    let pattern = new RegExp(`"${i.pathPrevious}"`, 'g');
    str = str.replace(pattern, `"${i.path}"`);
  });
  return str;
}

/**
 * Find, extract and return an array for the given dotnotation object key.
 *
 * @param {object} input The object JSON representation of XML
 * @param {string} key The key to find in the object
 * @returns {array} Extracted array of content from the XML
 */
export function extractArray(input, key) {
  let data = get(input, key) || [];
  if (!Array.isArray(data)) {
    return [data];
  } else {
    return data;
  }
}

/**
 * Generates a UUID v4
 * @returns {string} generated UUID V4
 */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
