import { get } from "shvl";

/**
 * A presentation slide representation
 * @class
 * @params {Object} content - The presentation slide content
 * @params {Object} presentation - The entire presentation
 */
export default class Slide {
  constructor(content, presentation) {
    this.originalContent = content;
    this.originalPresentation = presentation;
  }

  /**
   * @getter
   * @description deep copies the provided original content
   * @returns {object} a deep copy of the original content
   */
  get content() {
    return JSON.parse(JSON.stringify(this.originalContent));
  }

  /**
   * @getter
   * @description finds and returns the style name ids from within
   * the slide content
   * @returns {array} - array of style name IDs
   */
  get styleIDs() {
    let ids = [];
    ids.push(this.originalContent["draw:style-name"]);
    ["draw:frame", "draw:custom-shape", "draw:connector"].forEach(key => {
      if (this.originalContent[key]) {
        if (Array.isArray(this.originalContent[key])) {
          this.originalContent[key].forEach(item => {
            ids.push(item["draw:style-name"]);
          });
        } else {
          ids.push(this.originalContent[key]["draw:style-name"]);
        }
      }
    });

    return ids;
  }

  /**
   * @getter
   * @description finds and returns all the styles associated to the slide
   * from the global collection
   * @returns {array} - array of objects from the styling
   */
  get styles() {
    const documentStyles =
      get(this.originalPresentation, [
        "office:document-content",
        "office:automatic-styles",
        "style:style"
      ]) || [];
    return documentStyles.filter(item => {
      return this.styleIDs.includes(item["style:name"]);
    });
  }
}
