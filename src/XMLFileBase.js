import { uuid } from './utils';
import { parse as toJson } from 'fast-xml-parser';

export default class XMLFileBase {
  constructor(xml, id, rootKey, manifest) {
    this.manifest = manifest;
    this.rootKey = rootKey;
    this.id = id;
    if (id === undefined) {
      this.id = uuid();
    }
    this.xml = xml;
    this.contentCache = null;
  }

  /**
   * Extract XML namespaces from the JSON representation of XML
   *
   * @param {object} data The JSON representation of XML
   *
   * @returns {object} XML namespace keys pairs
   */
  get namespaces() {
    let out = {};
    for (let [key, value] of Object.entries(this.data[this.rootKey])) {
      if (key.startsWith('@_xmlns:')) {
        out[key] = value;
      }
    }
    return out;
  }

  get data() {
    return toJson(this.xml, {
      attributeNamePrefix: '@_',
      attrNodeName: false,
      ignoreAttributes: false,
      ignoreNameSpace: false
    });
  }

  get content() {
    if (this.contentCache) {
      return this.contentCache;
    }
    this.contentCache = this.data;
    this.contentCache = this.changeKeyReferences(this.contentCache);
    return this.contentCache;
  }

  get prefixKeys() {
    return [];
  }

  changeKeyReferences(content) {
    let str = JSON.stringify(content);
    this.prefixKeys.forEach(key => {
      let pat = new RegExp(`"${key}":"(.*?)"`, 'gsu');
      str = str.replace(pat, `"${key}":"${this.id}-$1"`);
    });
    content = JSON.parse(str);
    return content;
  }
}
