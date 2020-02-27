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
    this.styles = new Set();
    this.masterStyles = new Set();
    this.layouts = new Set();
    this.masterPages = new Set();
    this.presentationPageLayouts = new Set();
    this.styleNamespaes = new Set();
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
      'office:document-styles': {},
    };
  }

  async mergeFile(file) {
    const files = await decompress(file);
    const content = files.find(f => f.path === 'content.xml');
    const stylesDocument = files.find(f => f.path === 'styles.xml');
    let pres = new Presentation(JSON.parse(toJson(content.data)));
    let style = new Style(JSON.parse(toJson(stylesDocument.data)), pres);
    this.merge(pres);
    this.mergeStyles(style);
    this.mergeManifest(files);
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
        toXml(object, {
          // ignoreNull: true,
          // sanitize: true,
        }),
        {
          xmlSelfClosingSpace: true,
          xmlWhitespaceSensitivity: 'ignore',
          parser: 'xml',
        }
      );
    } catch (err) {
      console.log(
        object[('office:document-styles', 'office:styles', 'style:style')]
      );
      console.log(err);
    }
  }

  mergeStyles(style) {
    for (let [key, value] of Object.entries(style.namespaces)) {
      this.stylesDoc['office:document-styles'][key] = value;
    }

    style.masterPages.forEach(i => {
      this.masterPages.add(i);
    });
    set(
      this.stylesDoc,
      'office:document-styles.office:master-styles.style:master-page',
      Array.from(this.masterPages)
    );

    style.presentationPageLayouts.forEach(i => {
      this.presentationPageLayouts.add(i);
    });
    set(
      this.stylesDoc,
      'office:document-styles.office:styles.style:presentation-page-layout',
      Array.from(this.presentationPageLayouts)
    );
    style.styles.forEach((i) => {
      this.masterStyles.add(i)
    })
    set(
      this.stylesDoc,
      'office:document-styles.office:automatic-styles.style:style',
      Array.from(this.masterStyles)
    )
  }

  mergeManifest(files) {
    const manifest = files.find(f => f.path === 'META-INF/manifest.xml');
    let json = JSON.parse(toJson(manifest.data));
    const manifestFiles = get(json, 'manifest:manifest.manifest:file-entry');
    manifestFiles.forEach(manifestFile => {
      if (get(manifestFile, 'manifest:media-type').startsWith('image/')) {
        const file = files.find(
          f => f.path === manifestFile['manifest:full-path']
        );
        file.path = `Presentation${this.counter}/${file.path}`;
        this.files.push(file);
        this.manifestFiles.push({
          mimeType: manifestFile['manifest:media-type'],
          path: file.path,
        });
      }
    });
  }
}
