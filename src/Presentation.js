import { get } from "shvl";
import Slide from './Slide';
export default class Presentation {
  constructor(presentation) {
    this.presentation = presentation;
  }

  get slides() {
    const slides = get(this.presentation, [
      "office:document-content",
      "office:body",
      "office:presentation",
      "draw:page"
    ]) || [];
    return slides.map(slide => new Slide(slide, this.presentation))
  }
}
