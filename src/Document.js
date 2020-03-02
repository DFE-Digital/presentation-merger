import { get, set } from 'shvl';
import JSZip from 'jszip';
import decompress from 'decompress';
import EventEmitter from 'events';
import { toJson, toXml } from 'xml2json';
import { format } from 'prettier';
import Presentation from './Presentation';
import Style from './Style';

export default class Document extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
    this.slides = [];
    this.files = [];
    this.manifestFiles = [
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

  async mergeFile(file) {
    const files = await decompress(file);
    const content = files.find(f => f.path === 'content.xml');
    const stylesDocument = files.find(f => f.path === 'styles.xml');
    let manifest = this.mergeManifest(files);
    let pres = new Presentation(JSON.parse(toJson(content.data)), manifest);
    let style = new Style(
      JSON.parse(toJson(stylesDocument.data)),
      pres,
      manifest
    );
    this.merge(pres);
    // this.mergeContent(pres);
    this.mergeStyles(style);
    this.counter = this.counter + 1;
  }

  merge(pres) {
    if (!(pres instanceof Presentation)) {
      throw new TypeError(
        `expected Presentation class got ${pres.constructor.name}`
      );
    }
    this.slides = this.slides.concat(pres.slides);
    let slides = this.slides.map(slidesDocument => slidesDocument.content);
    let styles = this.slides
      .map(slidesDocument => slidesDocument.styles)
      .flat();

    Object.assign(this.doc['office:document-content'], pres.namespaces);
    set(
      this.doc,
      [
        'office:document-content',
        'office:body',
        'office:presentation',
        'draw:page',
      ],
      slides
    );

    set(
      this.doc,
      ['office:document-content', 'office:automatic-styles', 'style:style'],
      styles
    );
  }

  pipe(stream) {
    let zip = new JSZip();
    this.files.forEach(file => {
      zip.file(file.path, file.data);
    });
    zip.file('mimetype', 'application/vnd.oasis.opendocument.presentation');
    zip.file('content.xml', this.toFormattedXML(this.doc));
    zip.file('styles.xml', this.toFormattedXML(this.stylesDoc));
    zip.file('META-INF/manifest.xml', this.toFormattedXML(this.manifest));
    let promise = new Promise((resolve, reject) => {
      zip
        .generateNodeStream({
          type: 'nodebuffer',
          streamFiles: true,
          compression: 'DEFLATE',
          compressionOptions: {
            level: 9,
          },
        })
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
    try {
      return format(
        toXml(object),
        {
          xmlSelfClosingSpace: true,
          xmlWhitespaceSensitivity: 'ignore',
          parser: 'xml',
        }
      );
    } catch (err) {
      console.error(err);
      return toXml(object);
    }
  }

  mergeStyles(style) {
    for (let [key, value] of Object.entries(style.namespaces)) {
      this.stylesDoc['office:document-styles'][key] = value;
    }
    [
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
    ].forEach(key => {
      this._styleContent(style, key);
    });
  }

  mergeContent(content) {
    for (let [key, value] of Object.entries(content.namespaces)) {
      this.doc['office:document-content'][key] = value;
    }

    [
      'office:document-content.office:automatic-styles.style:style',
      'office:document-content.office:body.office:presentation.draw:page'
    ].forEach(key => {
      this._setContent(this.doc, content, key);
    });
  }

  _setContent(doc, item, key) {
    if (!this[key]) {
      this[key] = new Set();
    }
    item.extractArray(key).forEach(i => this[key].add(i));
    set(doc, key, Array.from(this[key]));
  }

  _styleContent(style, key) {
    if (!this[key]) {
      this[key] = new Set();
    }
    style.extractArray(key).forEach(i => this[key].add(i));
    set(this.stylesDoc, key, Array.from(this[key]));
  }

  mergeManifest(files) {
    const manifest = files.find(f => f.path === 'META-INF/manifest.xml');
    let json = JSON.parse(toJson(manifest.data));
    const manifestFiles = get(json, 'manifest:manifest.manifest:file-entry');
    return manifestFiles
      .map(manifestFile => {
        if (
          manifestFile['manifest:media-type'].startsWith('image/') ||
          manifestFile['manifest:full-path'].endsWith('.wmf')
        ) {
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
      })
      .filter(Boolean);
  }
}
