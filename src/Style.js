/** @module Style */
import { moveImageReferences, namespaces } from './utils';

/**
 * Class prepresenting `style.xml` in the presentation document
 */
export default class Style {
  /**
   * Create a style representation
   * @param {object} content JSON representation of `style.xml` document
   * @param {array} manifest The document manifest of image assets
   */
  constructor(content, manifest) {
    this.data = moveImageReferences(content, manifest);
    this.namespaces = namespaces(content['office:document-styles']);
  }
}
