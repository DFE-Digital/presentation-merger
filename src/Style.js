/** @module Style */
import XMLFileBase from './XMLFileBase';

/**
 * Class prepresenting `style.xml` in the presentation document
 */
export default class Style extends XMLFileBase {
  /**
   * Create a style representation
   * @param {string} xml XML content
   * @param {array} manifest The document manifest of image assets
   * @param {string} id unique identifier for the presentation
   */
  constructor(xml, manifest, id) {
    super(xml, id, 'office:document-styles', manifest);
  }

  get keys() {
    return [
      'office:document-styles.office:font-face-decls.style:font-face',
      'office:document-styles.office:styles.draw:gradient',
      'office:document-styles.office:styles.draw:hatch',
      'office:document-styles.office:styles.draw:fill-image',
      'office:document-styles.office:styles.draw:marker',
      'office:document-styles.office:styles.draw:stroke-dash',
      'office:document-styles.office:styles.style:default-style',
      'office:document-styles.office:styles.style:style',
      /**
       * @warning `presentation-page-layout` causes OpenOffice to crash when opening the document
       */
      // 'office:document-styles.office:styles.style:presentation-page-layout',
      'office:document-styles.office:automatic-styles.style:page-layout',
      'office:document-styles.office:automatic-styles.style:style',
      'office:document-styles.office:automatic-styles.text:list-style',
      'office:document-styles.office:master-styles.draw:layer-set.draw:layer',
      'office:document-styles.office:master-styles.style:handout-master',
      'office:document-styles.office:master-styles.style:master-page'
    ];
  }

  get prefixKeys() {
    return [
      '@_style:name',
      '@_style:page-layout-name',
      '@_style:parent-style-name',
      '@_draw:style-name',
      '@_draw:text-style-name',
      '@_presentation:style-name',
      '@_presentation:presentation-page-layout-name'
    ];
  }
}
