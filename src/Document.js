import { set } from "shvl";

import Presentation from "../src/Presentation";

export default class Document {
  constructor() {
    this.slides = [];
    this.doc = {
      "office:document-content": {
        "xmlns:dom": "http://www.w3.org/2001/xml-events",
        "xmlns:draw": "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
        "xmlns:fo":
          "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
        "xmlns:presentation":
          "urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
        "xmlns:script": "urn:oasis:names:tc:opendocument:xmlns:script:1.0",
        "xmlns:smil":
          "urn:oasis:names:tc:opendocument:xmlns:smil-compatible:1.0",
        "xmlns:style": "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
        "xmlns:svg": "urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",
        "xmlns:table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
        "xmlns:text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "xmlns:office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0"
      }
    };
  }

  merge(pres) {
    if (!(pres instanceof Presentation)) {
      throw new TypeError(
        `expected Presentation class got ${pres.constructor.name}`
      );
    }
    this.slides = this.slides.concat(pres.slides);
    let slides = this.slides.map(slidesDocument => slidesDocument.content);
    let styles = this.slides.map(slidesDocument => slidesDocument.styles);

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
}
