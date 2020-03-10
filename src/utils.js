import { get } from 'shvl';

/**
 * Replace images in content with references in the manifest from previous path locations
 *
 * @param {object} data The content which needs any image references replacing
 * @param {array} manifest Manifest of files that are included in the document, with previous paths for lookup and replacement
 *
 * @returns {object} Modified input data with any reference replaced within.
 */
export function moveImageReferences(data, manifest = []) {
  let str = JSON.stringify(data);
  manifest.forEach(i => {
    str = str.replace(new RegExp(i.pathPrevious, 'gi'), i.path);
  });

  return JSON.parse(str);
}

/**
 * Extract XML namespaces from the JSON representation of XML
 *
 * @param {object} data The JSON representation of XML
 *
 * @returns {object} XML namespace keys pairs
 */
export function namespaces(data) {
  let out = {};
  for (let [key, value] of Object.entries(data)) {
    if (key.startsWith('@_xmlns:')) {
      out[key] = value;
    }
  }
  return out;
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

/**
 * rename style keys
 * @param {object} document The document to rename the keys within
 * @param {array} keys The keys to rename the values of
 * @param {string} id The prefix unique id to define to the keys
 * @param {function} matcher Custom matcher to match on key
 */
export function renameKeys(document, keys, id, matcher) {
  if (!matcher) {
    matcher = key => key.endsWith(':name');
  }
  let str = JSON.stringify(document);
  keys.forEach(key => {
    let styles = extractArray(document, key);
    let keys = new Set();
    styles.forEach(style => {
      Object.entries(style).forEach(([key, value]) => {
        if (matcher(key)) {
          keys.add(value);
        }
      });
    });
    keys.forEach(key => {
      let newId = `"${id}-${key}"`;
      str = str.replace(new RegExp(`"${key}"`, 'g'), newId);
    });
  });
  document = JSON.parse(str);
  return document;
}
