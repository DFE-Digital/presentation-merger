import { get } from "shvl";
import Slide from "./Slide";
export default class Presentation {
  constructor(presentation) {
    this.presentation = presentation;
  }

  get namespaces() {
    let keys = Object.keys(this.presentation["office:document-content"]).filter(
      key => {
        return key.startsWith("xmlns:");
      }
    );
    let set = {}
    keys.forEach((key) => {
      set[key]= this.presentation['office:document-content'][key]
    })
    return set
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
