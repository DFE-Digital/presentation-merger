/** @module Style */
import XMLFileBase from './XMLFileBase';
// import { extractArray } from './utils';

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

  /*
  get arrayNotation() {
    return [
      'style:handout-master',
      'style:master-page',
      'style:style',
      'style:page-layout',
      'style:presentation-page-layout',
      'style:default-style',
      'draw:layer',
      'draw:stroke-dash',
      'draw:marker',
      'draw:fill-image',
      'draw:hatch',
      'draw:gradient',
      'draw:frame',
      'draw:custom-shape'
    ];
  }
  */

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
      // 'office:document-styles.office:automatic-styles.style:page-layout',
      'office:document-styles.office:automatic-styles.style:style',
      'office:document-styles.office:automatic-styles.text:list-style',
      // 'office:document-styles.office:master-styles.draw:layer-set.draw:layer',
      // 'office:document-styles.office:master-styles.style:handout-master',
      'office:document-styles.office:master-styles.style:master-page'
    ];
  }

  // eslint-disable-next-line max-lines-per-function
  changeKeyReferences(content) {
    // let arr = extractArray(
    //   content,
    //   'office:document-styles.office:automatic-styles.style:style'
    // );
    // let mp = extractArray(
    //   content,
    //   'office:document-styles.office:master-styles.style:master-page'
    // );
    // mp.forEach(e => {
    //   delete e['presentation:notes'];
    //   delete e['draw:custom-shape']; // @temp
    //   extractArray(e, 'draw:custom-shape').forEach(s => {
    //     if (s['@_presentation:style-name']) {
    //       s['@_presentation:style-name'] =
    //         this.id + '_' + s['@_presentation:style-name'];
    //     }
    //   });
    // });
    // arr.forEach(e => {
    //   if (e['@_style:family'] === 'presentation') {
    //     e['@_style:name'] = this.id + '_' + e['@_style:name'];
    //   }
    // });

    return content;
  }
}
