import { get } from "shvl";

export default class Slide {
  constructor(content, presentation) {
    this.originalContent = content;
    this.originalPresentation = presentation;
  }

  get content() {
    return JSON.parse(JSON.stringify(this.originalContent));
  }

  get styleIDs() {
    let ids = [];
    ids.push(this.content["draw:style-name"]);
    ["draw:frame", "draw:custom-shape", "draw:connector"].forEach(key => {
      if (this.content[key]) {
        this.content[key].forEach(item => {
          ids.push(item["draw:style-name"]);
        });
      }
    });

    return ids;
  }

  get styles() {
    const documentStyles = get(this.originalPresentation, [
      "office:document-content",
      "office:automatic-styles",
      "style:style"
    ]);
    return documentStyles.filter(item => {
      return this.styleIDs.includes(item["style:name"]);
    });
  }
}
