/** @module Merger */
import fs from 'fs';
import path from 'path';
import { set } from 'shvl';
import { format } from 'prettier';
import { extractArray } from '../src/utils';
import Presentation from '../src/Presentation';
import Style from '../src/Style';

import { j2xParser as Parser } from 'fast-xml-parser';

let counter = 0;
export default class Merger {
  constructor(type, manifest) {
    if (!type || !['content', 'styles'].includes(type)) {
      throw new Error('missing `rootKey` expected "content" or "styles"');
    }
    this.doc = {};
    this.type = type;
    this.manifest = manifest;
  }

  get parserOptions() {
    return {
      attributeNamePrefix: '@_',
      attrNodeName: false,
      ignoreAttributes: false,
      ignoreNameSpace: false,
      arrayMode: true
    };
  }

  merge(xml) {
    let obj = this.toObj(xml);
    for (let [key, value] of Object.entries(obj.namespaces)) {
      set(this.doc, [obj.rootKey, key], value);
    }
    set(this.doc, [obj.rootKey, '@_office:version'], '1.2');
    obj.keys.forEach(key => {
      if (!this[key]) {
        this[key] = new Set();
      }
      extractArray(obj.content, key).forEach(d => {
        this[key].add(d);
      });
      set(this.doc, key, Array.from(this[key]));
    });
    counter++;
  }

  toObj(xml) {
    if (this.type === 'content') {
      return new Presentation(xml, this.manifest, counter);
    } else if (this.type === 'styles') {
      return new Style(xml, this.manifest, counter);
    } else {
      throw new Error(`Unhandled content type '${this.type}'`);
    }
  }

  toXml(formatted = true) {
    let parser = new Parser(this.parserOptions);
    let xml = parser.parse(this.doc);
    xml = `<?xml version="1.0" encoding="UTF-8" ?>\n${xml}`;
    if (formatted) {
      xml = format(xml, {
        xmlSelfClosingSpace: true,
        xmlWhitespaceSensitivity: 'ignore',
        parser: 'xml'
      });
    }
    fs.writeFileSync(path.join(__dirname, `./${this.type}.xml`), xml);
    return xml;
  }
}
