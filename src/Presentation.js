import { get } from 'shvl';
import { namespaces, uuid } from './utils';
export default class Presentation {
  constructor(presentation, id) {
    this.id = id;
    if (id === undefined) {
      this.id = uuid();
    }
    this.data = presentation;
    this._uniqueStyleIDs();
    this.presentation = this.data;
    this.namespaces = namespaces(presentation['office:document-content']);
  }

  _uniqueStyleIDs() {
    [
      'office:document-content.office:automatic-styles.style:style',
      'office:document-content.office:automatic-styles.text:list-style',
    ].forEach(key => {
      this.data = this._renameStyleKeys(this.data, key);
    });
  }

  _renameStyleKeys(document, key) {
    let styles = get(document, key);
    let keys = new Set();
    styles.forEach(style => {
      Object.entries(style).forEach(([key, value]) => {
        if (key.endsWith(':name')) {
          keys.add(value);
        }
      });
    });
    let str = JSON.stringify(document);
    keys.forEach(key => {
      let newId = `${this.id}-${key}`;
      str = str.replace(new RegExp(key, 'g'), newId);
    });
    return JSON.parse(str);
  }
}
