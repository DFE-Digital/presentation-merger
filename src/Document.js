import { get, set } from "shvl";
import JSZip from "jszip";
import decompress from "decompress";
import EventEmitter from "events";
import { toJson, toXml } from "xml2json";
import { format } from "prettier";

import Presentation from "../src/Presentation";

export default class Document extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
    this.slides = [];
    this.files = [];
    this.manifestFiles = [
      {
        mimeType: "application/vnd.oasis.opendocument.presentation",
        path: "/",
        version: "1.2"
      },
      {
        mimeType: "text/xml",
        path: "content.xml"
      }
    ];
    this.counter = 0;
    this.doc = {
      "office:document-content": {}
    };
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
        this.manifestFiles.push({
          mimeType: manifestFile["manifest:media-type"],
          path: file.path
        });
      }
    });
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

    Object.assign(this.doc["office:document-content"], pres.namespaces);
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
    zip.file("mimetype", "application/vnd.oasis.opendocument.presentation");
    zip.file("content.xml", this.toFormattedXML(this.doc));
    zip.file("META-INF/manifest.xml", this.toFormattedXML(this.manifest));
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

  get manifest() {
    let output = {
      "manifest:manifest": {
        "xmlns:manifest": "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
        "manifest:version": "1.2",
        "manifest:file-entry": []
      }
    };
    output["manifest:manifest"]["manifest:file-entry"] = this.manifestFiles.map(
      file => {
        let out = {
          "manifest:full-path": file.path,
          "manifest:media-type": file.mimeType
        };
        if (file.version) {
          out["manifest:version"] = file.version;
        }
        return out;
      }
    );
    return output;
  }

  toFormattedXML(object) {
    return format(toXml(object), {
      xmlSelfClosingSpace: true,
      xmlWhitespaceSensitivity: "ignore",
      parser: "xml"
    });
  }
}
