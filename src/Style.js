import { get } from 'shvl';

export default class Style {
  constructor(stylesData, presentation, manifest) {
    this.manifest = manifest || [];
    this.data = stylesData;
    this.moveImageReferences();
    this.presentation = presentation;
    this.doc;
    this.styleIDs = new Set();
  }

  moveImageReferences() {
    let str = JSON.stringify(this.data);
    this.manifest.forEach(i => {
      str = str.replace(new RegExp(i.pathPrevious, 'gi'), i.path);
    });
    this.data = JSON.parse(str);
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
