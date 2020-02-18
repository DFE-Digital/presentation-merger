export default class Slide {
  constructor(content, style) {
    this.originalContent = content;
    this.originalStyle = style;
  }

  get content() {
    return JSON.parse(JSON.stringify(this.originalContent));
  }

  get style() {
    return JSON.parse(JSON.stringify(this.originalContent));
  }
}
