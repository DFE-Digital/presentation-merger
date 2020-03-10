/** @module Document */
import fs from 'fs';
import path from 'path';
import { get } from 'shvl';
import JSZip from 'jszip';
import decompress from 'decompress';
import EventEmitter from 'events';
import { toJson, toXml } from 'xml2json';
import { format } from 'prettier';
import { moveImageReferences } from './utils';
import Merger from './Merger';

/**
 * Class representing a new presentation document to merge files into
 * @extends EventEmitter
 */
export default class Document extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
    this.slides = [];
    this.files = [];
    this.manifestFiles = this.manifestFilesInitial;
    this.counter = 0;
    this.styles = new Merger('styles');
    this.content = new Merger('content');
  }

  get manifestFilesInitial() {
    return [
      {
        mimeType: 'application/vnd.oasis.opendocument.presentation',
        path: '/',
        version: '1.2'
      },
      {
        mimeType: 'text/xml',
        path: 'content.xml'
      },
      {
        mimeType: 'text/xml',
        path: 'styles.xml'
      }
    ];
  }

  /**
   * Merge the given file to the document
   * @param {string} file The file path to merge to the document
   */
  async mergeFile(file) {
    const files = await decompress(file, path);
    let manifest = this.mergeManifest(files);
    const contentXML = files.find(f => f.path === 'content.xml');
    const stylesXML = files.find(f => f.path === 'styles.xml');
    this.styles.merge(stylesXML.data.toString());
    this.content.merge(contentXML.data.toString());
    this.styles.doc = moveImageReferences(this.styles.doc, manifest);
    this.content.doc = moveImageReferences(this.content.doc, manifest);
    this.counter = this.counter + 1;
  }

  get ZIPOptions() {
    return {
      type: 'nodebuffer',
      streamFiles: true,
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9
      }
    };
  }

  /**
   * Pipe the merged files through the ZIP stream to return the expected encapulation for presentaitons.
   *
   * @param {stream.WriteStream} stream The output stream for the zipped contents to write to
   */
  pipe(stream) {
    let promise = new Promise((resolve, reject) => {
      let zip = this._zipFiles();

      zip
        .generateNodeStream(this.ZIPOptions)
        .pipe(stream)
        .on('finish', () => {
          resolve(zip);
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
    zip.file('content.xml', this.content.toXml(true));
    zip.file('META-INF/manifest.xml', this.toFormattedXML(this.manifest));
    zip.file('styles.xml', this.styles.toXml(true));
    return zip;
  }

  get manifest() {
    let output = {
      'manifest:manifest': {
        'xmlns:manifest': 'urn:oasis:names:tc:opendocument:xmlns:manifest:1.0',
        'manifest:version': '1.2',
        'manifest:file-entry': []
      }
    };
    output['manifest:manifest']['manifest:file-entry'] = this.manifestFiles.map(
      file => {
        let out = {
          'manifest:full-path': file.path,
          'manifest:media-type': file.mimeType
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
    let xml = toXml(object);
    let fmt = '';
    try {
      fmt = format(xml, {
        xmlSelfClosingSpace: true,
        xmlWhitespaceSensitivity: 'ignore',
        parser: 'xml'
      });
    } catch (err) {
      // console.error(err);
      fmt = xml;
    }
    fs.writeFileSync(path.join(__dirname, './out.xml'), fmt);
    return fmt;
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
        path: file.path
      });
      return {
        mimeType: manifestFile['manifest:media-type'],
        pathPrevious: manifestFile['manifest:full-path'],
        path: file.path
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
