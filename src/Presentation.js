/** @module Presentation */
import XMLFileBase from './XMLFileBase';

/**
 * Class prepresenting `content.xml` in the presentation document
 */
export default class Presentation extends XMLFileBase {
  /**
   * Create a presentation content representation.
   * @param {string} xml XML content
   * @param {array} manifest The document manifest of image assets
   * @param {string} id unique identifier for the presentation
   */
  constructor(xml, manifest, id) {
    super(xml, id, 'office:document-content', manifest);
    this.arrayNotation = [
      'style:style',
      'style:font-face',
      'text:list-style',
      'draw:page'
    ];
  }

  get keys() {
    return [
      'office:document-content.office:scripts',
      'office:document-content.office:font-face-decls.style:font-face',
      'office:document-content.office:automatic-styles.style:style',
      'office:document-content.office:automatic-styles.text:list-style',
      'office:document-content.office:automatic-styles.number:date-style',
      'office:document-content.office:body.office:presentation.draw:page'
      // 'office:document-content.office:body.office:presentation.presentation:settings'
    ];
  }
  changeKeyReferences(c) {
    return c;
  }
}
