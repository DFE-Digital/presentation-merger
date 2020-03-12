/** @module Manifest */
import { j2xParser as Parser } from 'fast-xml-parser';
import { get } from 'shvl';
import { parse as toJson } from 'fast-xml-parser';

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
  }

  async merge(zip, counter) {
    const manifest = await zip.file('META-INF/manifest.xml').async('string');
    let json = toJson(manifest, {
      attributeNamePrefix: '@_',
      attrNodeName: false,
      ignoreAttributes: false,
      ignoreNameSpace: false
    });
    const manifestFiles = get(json, 'manifest:manifest.manifest:file-entry');
    const response = manifestFiles
      .map(manifestFile => this._manifestMapEntry(zip, manifestFile, counter))
      .filter(Boolean);
    return response;
  }

  _manifestMapEntry(zip, manifestFile, counter) {
    if (this._manifestIsImageEntry(manifestFile)) {
      const file = zip.file(manifestFile['@_manifest:full-path']);
      file.data = file.async('uint8array');
      file.path = `Presentation${counter}-${file.name}`;
      this.files.push(file);
      this.manifestFiles.push({
        mimeType: manifestFile['@_manifest:media-type'],
        path: file.path
      });
      return {
        mimeType: manifestFile['@_manifest:media-type'],
        pathPrevious: manifestFile['@_manifest:full-path'],
        path: file.path
      };
    }
  }
  _manifestIsImageEntry(manifestFile) {
    return (
      manifestFile['@_manifest:media-type'].startsWith('image/') ||
      manifestFile['@_manifest:full-path'].endsWith('.wmf')
    );
  }

  get doc() {
    let output = {
      'manifest:manifest': {
        '@_xmlns:manifest':
          'urn:oasis:names:tc:opendocument:xmlns:manifest:1.0',
        '@_manifest:version': '1.2',
        '@_manifest:file-entry': []
      }
    };
    output['manifest:manifest']['manifest:file-entry'] = this.manifestFiles.map(
      file => {
        let out = {
          '@_manifest:full-path': file.path,
          '@_manifest:media-type': file.mimeType
        };
        if (file.version) {
          out['@_manifest:version'] = file.version;
        }
        return out;
      }
    );
    return output;
  }

  toXml(formatted = true) {
    const options = {
      format: formatted,
      attributeNamePrefix: '@_',
      attrNodeName: false,
      ignoreAttributes: false,
      ignoreNameSpace: false
    };
    const parser = new Parser(options);
    let xml = parser.parse(this.doc);
    if (!xml) {
      return '';
    }
    xml = `<?xml version="1.0" encoding="UTF-8" ?>\n${xml}`;
    return xml;
  }
}
