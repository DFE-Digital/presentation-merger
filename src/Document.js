import { get, set } from 'shvl';
import JSZip from 'jszip';
import decompress from 'decompress';
import EventEmitter from 'events';
import { toJson, toXml } from 'xml2json';
import { format } from 'prettier';
import { extractArray } from './utils';

import Presentation from './Presentation';
import Style from './Style';

export default class Document extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
    this.slides = [];
    this.files = [];
    this.manifestFiles = this.manifestFilesInitial;
    this.counter = 0;
    this.doc = {
      'office:document-content': {},
    };
    this.stylesDoc = {
      'office:document-styles': {
        'office:version': '1.2',
      },
    };
  }

  get manifestFilesInitial() {
    return [
      {
        mimeType: 'application/vnd.oasis.opendocument.presentation',
        path: '/',
        version: '1.2',
      },
      {
        mimeType: 'text/xml',
        path: 'content.xml',
      },
      {
        mimeType: 'text/xml',
        path: 'styles.xml',
      },
    ];
  }

  async mergeFile(file) {
    const files = await decompress(file);
    const content = files.find(f => f.path === 'content.xml');
    const stylesDocument = files.find(f => f.path === 'styles.xml');
    let manifest = this.mergeManifest(files);
    let pres = new Presentation(JSON.parse(toJson(content.data)), this.counter);
    let style = new Style(
      JSON.parse(toJson(stylesDocument.data)),
      pres,
      manifest
    );
    this.mergeContent(pres, manifest);
    this.mergeStyles(style, manifest);
    this.counter = this.counter + 1;
  }

  get contentKeys() {
    return [
      'office:document-content.office:automatic-styles.style:style',
      'office:document-content.office:automatic-styles.text:list-style',
      'office:document-content.office:body.office:presentation.draw:page',
      'office:document-content.office:body.office:presentation.presentation:settings',
    ];
  }

  get styleKeys() {
    return [
      'office:document-styles.office:styles.draw:gradient',
      'office:document-styles.office:styles.draw:hatch',
      'office:document-styles.office:styles.draw:fill-image',
      'office:document-styles.office:styles.draw:marker',
      'office:document-styles.office:styles.draw:stroke-dash',
      'office:document-styles.office:styles.style:default-style',
      'office:document-styles.office:styles.style:style',
      /**
       * @warning `presentation-page-layout` causes OpenOffice to crash when opening the document
       */
      // 'office:document-styles.office:styles.style:presentation-page-layout',
      'office:document-styles.office:automatic-styles.style:page-layout',
      'office:document-styles.office:automatic-styles.style:style',
      'office:document-styles.office:master-styles.draw:layer-set',
      'office:document-styles.office:master-styles.style:handout-master',
      'office:document-styles.office:master-styles.style:master-page',
    ];
  }

  mergeContent(pres) {
    this._merge(this.doc, pres, 'office:document-content', this.contentKeys);
  }

  mergeStyles(style) {
    this._merge(
      this.stylesDoc,
      style,
      'office:document-styles',
      this.styleKeys
    );
  }

  _merge(doc, obj, rootKey, keys) {
    for (let [key, value] of Object.entries(obj.namespaces)) {
      doc[rootKey][key] = value;
    }
    keys.forEach(key => {
      this._content(doc, obj.data, key);
    });
  }

  _content(doc, data, key) {
    if (!this[key]) {
      this[key] = new Set();
    }
    extractArray(data, key).forEach(i => this[key].add(i));
    set(doc, key, Array.from(this[key]));
  }

  get ZIPOptions() {
    return {
      type: 'nodebuffer',
      streamFiles: true,
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    };
  }

  pipe(stream) {
    let promise = new Promise((resolve, reject) => {
      this._zipFiles()
        .generateNodeStream(this.ZIPOptions)
        .pipe(stream)
        .on('finish', () => {
          resolve();
          this.emit('end');
        })
        .on('error', err => {
          reject(err);
          this.emit('error', err);
        });
    });
    return promise;
  }

  _zipFiles() {
    let zip = new JSZip();
    this.files.forEach(file => {
      zip.file(file.path, file.data);
    });
    zip.file('mimetype', 'application/vnd.oasis.opendocument.presentation');
    zip.file('content.xml', this.toFormattedXML(this.doc));
    zip.file('styles.xml', this.toFormattedXML(this.stylesDoc));
    zip.file('META-INF/manifest.xml', this.toFormattedXML(this.manifest));
    return zip;
  }

  get manifest() {
    let output = {
      'manifest:manifest': {
        'xmlns:manifest': 'urn:oasis:names:tc:opendocument:xmlns:manifest:1.0',
        'manifest:version': '1.2',
        'manifest:file-entry': [],
      },
    };
    output['manifest:manifest']['manifest:file-entry'] = this.manifestFiles.map(
      file => {
        let out = {
          'manifest:full-path': file.path,
          'manifest:media-type': file.mimeType,
        };
        if (file.version) {
          out['manifest:version'] = file.version;
        }
        return out;
      }
    );
    return output;
  }

  toFormattedXML(object) {
    return format(toXml(object), {
      xmlSelfClosingSpace: true,
      xmlWhitespaceSensitivity: 'ignore',
      parser: 'xml',
    });
  }

  mergeManifest(files) {
    const manifest = files.find(f => f.path === 'META-INF/manifest.xml');
    let json = JSON.parse(toJson(manifest.data));
    const manifestFiles = get(json, 'manifest:manifest.manifest:file-entry');
    return manifestFiles
      .map(manifestFile => this._manifestMapEntry(files, manifestFile))
      .filter(Boolean);
  }

  _manifestMapEntry(files, manifestFile) {
    if (this._manifestIsImageEntry(manifestFile)) {
      const file = files.find(
        f => f.path === manifestFile['manifest:full-path']
      );
      file.path = `Presentation${this.counter}-${file.path}`;
      this.files.push(file);
      this.manifestFiles.push({
        mimeType: manifestFile['manifest:media-type'],
        path: file.path,
      });
      return {
        mimeType: manifestFile['manifest:media-type'],
        pathPrevious: manifestFile['manifest:full-path'],
        path: file.path,
      };
    }
  }

  _manifestIsImageEntry(manifestFile) {
    return (
      manifestFile['manifest:media-type'].startsWith('image/') ||
      manifestFile['manifest:full-path'].endsWith('.wmf')
    );
  }
}
