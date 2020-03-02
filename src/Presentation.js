import { get } from "shvl";
import Slide from "./Slide";
export default class Presentation {
  constructor(presentation) {
    this.presentation = presentation;
  }

  get namespaces() {
    let out = {};
    for (let [key, value] of Object.entries(
      this.presentation['office:document-content']
    )) {
      if (key.startsWith('xmlns:')) {
        out[key] = value;
      }
    }
    return out;
  }

  get slides() {
    const slides =
      get(this.presentation, [
        "office:document-content",
        "office:body",
        "office:presentation",
        "draw:page"
      ]) || [];
    return slides.map(slide => new Slide(slide, this.presentation));
  }
}
