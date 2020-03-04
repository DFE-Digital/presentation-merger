import { moveImageReferences } from './utils'
import { get } from 'shvl';

export default class Style{
  constructor(content, presentation, manifest) {
    this.data = moveImageReferences(content, manifest)
    this.presentation = presentation;
    this.doc;
    this.styleIDs = new Set();
  }

  get namespaces() {
    let out = {};
    for (let [key, value] of Object.entries(
      this.data['office:document-styles']
    )) {
      if (key.startsWith('xmlns:')) {
        out[key] = value;
      }
    }
    return out;
  }

  extractArray(key) {
    let data = get(this.data, key) || [];
    if (!Array.isArray(data)) {
      return [data];
    } else {
      return data;
    }
  }
}
