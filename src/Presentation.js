import { get } from "shvl";
import { namespaces } from './utils'
import Slide from "./Slide";
export default class Presentation {
  constructor(presentation) {
    this.presentation = presentation;
    this.namespaces = namespaces(presentation['office:document-content'])
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
