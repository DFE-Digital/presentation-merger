import fs from "fs";
import path from "path";
import { get, set } from "shvl";
import parser from "xml2json";
import JSZip from "jszip";

const decompress = require("decompress");

/**
 * @WIP this is a working in progress to extract slides from existing presentations
 * creating a new document.
 */
export default async function main(file) {
  const files = await decompress(file);
  const content = files.find(item => item.path === "content.xml");

  const json = parser.toJson(content.data);
  // fs.writeFileSync(
  //   "./example.json",
  //   JSON.stringify(JSON.parse(json), null, "  "),
  //   { encoding: "utf8" }
  // );

  let presentation = JSON.parse(json);
  const slide = get(presentation, [
    "office:document-content",
    "office:body",
    "office:presentation",
    "draw:page",
    4
  ]);

  const slideCopy = JSON.parse(JSON.stringify(slide));

  set(
    presentation,
    [
      "office:document-content",
      "office:body",
      "office:presentation",
      "draw:page"
    ],
    [slideCopy]
  );

  const xml = parser.toXml(JSON.stringify(presentation));

  // debugging
  // console.log(content.data.toString().slice(0, 1000));
  // console.log(xml.slice(0, 1000));
  // endDebugging

  let zip = new JSZip();
  files.forEach(file => {
    if (file.path === "content.xml") {
      zip.file(file.path, xml);
    } else {
      zip.file(file.path, file.data);
    }
  });
  let promise = new Promise((resolve, reject) => {
    let filepath = path.join(path.dirname(file), "./output.odp");
    let outZip = fs.createWriteStream(filepath);
    zip
      .generateNodeStream({
        type: "nodebuffer",
        streamFiles: true,
        compression: "DEFLATE",
        compressionOptions: {
          level: 9
        }
      })
      .pipe(outZip)
      .on("finish", () => {
        resolve(filepath);
      })
      .on("error", err => {
        reject(err);
      });
  });
  await promise;
}
