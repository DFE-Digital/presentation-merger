/** @module Document */
import JSZip from 'jszip';
import EventEmitter from 'events';
import { moveImageReferences } from './utils';
import Merger from './Merger';
import Manifest from './Manifest';
import { readFileSync } from 'fs';

/**
 * Class representing a new presentation document to merge files into
 * @extends EventEmitter
 */
export default class Document extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
    this.counter = 0;
    this.styles = new Merger('styles');
    this.content = new Merger('content');
    this.manifest = new Manifest();
  }

  /**
   * Merge the given file to the document
   * @param {string} file The file path to merge to the document
   */
  async mergeFile(file) {
    const data = readFileSync(file);
    let zip = await JSZip.loadAsync(data);
    const contentXML = await zip.file('content.xml').async('string');
    const stylesXML = await zip.file('styles.xml').async('string');
    const manifest = await this.manifest.merge(zip);
    this.styles.merge(stylesXML);
    this.content.merge(contentXML);
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
          this.emit('end', zip);
        })
        .on('error', err => {
          reject(err);
          this.emit('error', err);
        });
    });
    return promise;
  }

  _zipFiles() {
    const zip = new JSZip();
    zip.file('mimetype', 'application/vnd.oasis.opendocument.presentation');
    zip.file('META-INF/manifest.xml', this.manifest.toXml());
    zip.file('content.xml', this.content.toXml());
    zip.file('styles.xml', this.styles.toXml());
    this.manifest.files.forEach(file => {
      zip.file(file.path, file.data);
    });
    return zip;
  }
}
