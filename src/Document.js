import { get, set } from "shvl";
import JSZip from "jszip";
import decompress from "decompress";
import EventEmitter from "events";
import { toJson, toXml } from "xml2json";
import format from "xml-formatter";

import Presentation from "../src/Presentation";

export default class Document extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
    this.slides = [];
    this.files = [];
    this.manifest = [
      {
        type: "application/vnd.oasis.opendocument.presentation",
        path: '/'
      },
      {
        type: "text/xml",
        path: "content.xml"
      }
    ];
    this.counter = 0;
    this.doc = {
      'office:document-content': {}
    }
  }

  async mergeFile(file) {
    const files = await decompress(file);
    const manifest = files.find(f => f.path === "META-INF/manifest.xml");
    let json = JSON.parse(toJson(manifest.data));
    const manifestFiles = get(json, "manifest:manifest.manifest:file-entry");
    const content = files.find(f => f.path === "content.xml");
    let pres = new Presentation(JSON.parse(toJson(content.data)));
    this.merge(pres);
    manifestFiles.forEach(manifestFile => {
      if (get(manifestFile, "manifest:media-type").startsWith("image/")) {
        const file = files.find(
          f => f.path === manifestFile["manifest:full-path"]
        );
        file.path = `Presentation${this.counter}/${file.path}`;
        this.files.push(file);
        this.manifest.push({
          type: file.type,
          path: file.path
        })
      }
    });
    this.counter++;
  }

  merge(pres) {
    if (!(pres instanceof Presentation)) {
      throw new TypeError(
        `expected Presentation class got ${pres.constructor.name}`
      );
    }
    this.slides = this.slides.concat(pres.slides);
    let slides = this.slides.map(slidesDocument => slidesDocument.content);
    let styles = this.slides.map(slidesDocument => slidesDocument.styles).flat();

    Object.assign(this.doc['office:document-content'], pres.namespaces)
    set(
      this.doc,
      [
        "office:document-content",
        "office:body",
        "office:presentation",
        "draw:page"
      ],
      slides
    );

    set(
      this.doc,
      ["office:document-content", "office:automatic-styles", "style:style"],
      styles
    );
  }

  pipe(stream) {
    let zip = new JSZip();
    this.files.forEach(file => {
      zip.file(file.path, file.data);
    });
    zip.file("memetype", "application/vnd.oasis.opendocument.presentation");
    zip.file("content.xml", format(toXml(this.doc)));
    
    let paths = {
      'manifest:manifest': {
        'manifest:file-entry': []
      }
    }
    this.manifest.forEach((manifestItem) => {
      paths["manifest:manifest"]["manifest:file-entry"].push({
        "manifest:full-path": manifestItem.path,
        "manifest:media-type": manifestItem.type
      });
    })
    zip.file("META-INF/manifest.xml", format(toXml(paths)));
    let promise = new Promise((resolve, reject) => {
      zip
        .generateNodeStream({
          type: "nodebuffer",
          streamFiles: true,
          compression: "DEFLATE",
          compressionOptions: {
            level: 9
          }
        })
        .pipe(stream)
        .on("finish", () => {
          resolve();
          this.emit("end");
        })
        .on("error", err => {
          reject(err);
          this.emit("error", err);
        });
    });
    return promise;
  }
}
