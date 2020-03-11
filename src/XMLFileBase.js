import { get, set } from 'shvl';
import { uuid, namespaces } from './utils';
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

  get namespaces() {
    return namespaces(this.data[this.rootKey]);
  }

  get data() {
    return toJson(this.xml, {
      attributeNamePrefix: '@_',
      attrNodeName: false,
      ignoreAttributes: false,
      ignoreNameSpace: false
    });
  }

  get contentOriginal() {
    return this.keys.reduce((obj, key) => {
      set(obj, key, get(this.data, key));
      return obj;
    }, {});
  }

  get content() {
    if (this.contentCache) {
      return this.contentCache;
    }
    this.contentCache = this.data;
    // this.contentCache = this.changeImagePaths(this.contentCache);
    // this.contentCache = this.changeKeyReferences(this.contentCache);
    return this.contentCache;
  }

  changeImagePaths(obj) {
    let str = JSON.stringify(obj);
    str = this.manifest.reduce((str, i) => {
      return str.replace(new RegExp(i.pathPrevious, 'gi'), i.path);
    }, str);
    return JSON.parse(str);
  }

  // changeKeyReferences(content) {
  //   const matcher = key => {
  //     return [
  //       // 'draw:style-name',
  //       // 'style:name',
  //       // ':style-name',
  //       // ':master-page-name',
  //       // ':text-style-name'
  //       // ':page-layout-name',
  //       // 'presentation:presentation-page-layout-name',
  //       // 'style:page-layout-name'
  //     ].some(end => key.endsWith(end));
  //   };
  //   return renameKeys(content, this.keys, this.id, matcher);
  // }
}
