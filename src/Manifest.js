/** @module Manifest */
import { j2xParser as Parser } from 'fast-xml-parser';
import { get } from 'shvl';
import { parse as toJson } from 'fast-xml-parser';
import { format } from 'prettier';

export default class Manifest {
  constructor() {
    this.manifestFiles = [
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
    this.files = [];
    this.counter = 0;
  }

  merge(files) {
    const manifest = files.find(f => f.path === 'META-INF/manifest.xml');
    let json = toJson(manifest.data.toString(), {
      attributeNamePrefix: '',
      attrNodeName: false,
      ignoreAttributes: false,
      ignoreNameSpace: false
    });
    const manifestFiles = get(json, 'manifest:manifest.manifest:file-entry');
    const response = manifestFiles
      .map(manifestFile => this._manifestMapEntry(files, manifestFile))
      .filter(Boolean);
    this.counter++;
    return response;
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

  get doc() {
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

  toXml(formatted = true) {
    let parser = new Parser(this.parserOptions);
    let xml = parser.parse(this.doc);
    if (!xml) {
      return '';
    }
    xml = `<?xml version="1.0" encoding="UTF-8" ?>\n${xml}`;
    if (formatted) {
      xml = format(xml, {
        xmlSelfClosingSpace: true,
        xmlWhitespaceSensitivity: 'ignore',
        parser: 'xml'
      });
    }
    return xml;
  }
}
