import { moveImageReferences, namespaces } from './utils'
import { get } from 'shvl';

export default class Style{
  constructor(content, presentation, manifest) {
    this.data = moveImageReferences(content, manifest)
    this.namespaces = namespaces(content['office:document-styles'])
    this.presentation = presentation;
    this.doc;
    this.styleIDs = new Set();
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
