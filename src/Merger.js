/** @module Merger */
import { set } from 'shvl';
import { format } from 'prettier';
import { extractArray } from './utils';
import Presentation from './Presentation';
import Style from './Style';

import { j2xParser as Parser } from 'fast-xml-parser';

function containsObject(needle, haystack) {
  for (var i in haystack) {
    var count = 0,
      matching = true;

    for (var key in needle) {
      if (haystack[i][key] === needle[key]) {
        matching = true;

        if (count == Object.keys(haystack[i]).length - 1 && matching) {
          return true;
        } else {
          count++;
        }
      } else {
        matching = false;
      }
    }
  }

  return false;
}

/**
 * Class extraction for merging XML documents into a single source
 */
export default class Merger {
  /**
   * Create a mergable document
   * @param {string} type The type of content to merge
   * @param {array} manifest The docuemnt manifest of assets
   */
  constructor(type, manifest) {
    if (!type || !['content', 'styles'].includes(type)) {
      throw new Error('missing `rootKey` expected "content" or "styles"');
    }
    this.doc = {};
    this.type = type;
    this.manifest = manifest;
    this.counter = 0;
  }

  /**
   * @getter
   * Default parser options for FastXMLParser
   * @returns {object} options for FastXMLParser
   */
  get parserOptions() {
    return {
      attributeNamePrefix: '@_',
      attrNodeName: false,
      ignoreAttributes: false,
      ignoreNameSpace: false,
      arrayMode: true
    };
  }

  /**
   * Merge XMl into the document
   * @param {string} xml XML Content to parse, and merge into the single document
   */
  merge(xml) {
    let obj = this.toObj(xml);
    for (let [key, value] of Object.entries(obj.namespaces)) {
      set(this.doc, [obj.rootKey, key], value);
    }
    set(this.doc, [obj.rootKey, '@_office:version'], '1.2');
    obj.keys.forEach(key => {
      if (!this[key]) {
        this[key] = [];
      }
      extractArray(obj.content, key).forEach(d => {
        if (!containsObject(d, this[key])) {
          this[key].push(d);
        }
      });
      set(this.doc, key, this[key]);
    });
    this.counter++;
  }

  /**
   * Convert the given XML to a class representation of the document.
   * @param {string} xml XML Content to parse
   * @throws Unhandled content type when type is unrecognised
   * @returns Class represtation of the XML type
   */
  toObj(xml) {
    if (this.type === 'content') {
      return new Presentation(xml, this.manifest, this.counter);
    } else if (this.type === 'styles') {
      return new Style(xml, this.manifest, this.counter);
    } else {
      throw new Error(`Unhandled content type '${this.type}'`);
    }
  }

  /**
   * Convert the document object model to XML format.
   * @param {boolean} formatted Pretty print the generated XML
   * @returns {string} XML content
   */
  toXml(formatted = true) {
    let parser = new Parser(this.parserOptions);
    let xml = parser.parse(this.doc);
    if (!xml) {
      return '';
    }
    xml = `<?xml version="1.0" encoding="UTF-8" ?>\n${xml}`;
    if (formatted) {
      xml = format(xml, {
        xmlSelfClosingSpace: true,
        xmlWhitespaceSensitivity: 'ignore',
        parser: 'xml'
      });
    }
    return xml;
  }
}
