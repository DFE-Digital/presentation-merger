/** @module Presentation */
import XMLFileBase from './XMLFileBase';
import { extractArray } from './utils';
import { set } from 'shvl';

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
    let stylesKey =
      'office:document-content.office:automatic-styles.style:style';
    changePresenationKeys(c, this.id, stylesKey);
    return c;
  }
}

// eslint-disable-next-line max-lines-per-function
function changePresenationKeys(doc, id, parentArrayKey) {
  let drawPageKey =
    'office:document-content.office:body.office:presentation.draw:page';
  // eslint-disable-next-line max-lines-per-function
  extractArray(doc, parentArrayKey).forEach(style => {
    let originalName = style['@_style:name'].toString();
    style['@_style:name'] = `${id}-${style['@_style:name']}`;
    extractArray(
      doc,
      drawPageKey
      // eslint-disable-next-line max-lines-per-function
    ).forEach((page, index) => {
      if (
        page['@_draw:style-name'] === originalName &&
        style['@_style:family'] === 'drawing-page'
      ) {
        page['@_draw:style-name'] = style['@_style:name'];
      }

      extractArray(page, 'draw:frame').forEach(frame => {
        if (
          style['@_style:family'] === 'presentation' &&
          frame['@_presentation:style-name'] === originalName
        ) {
          frame['@_presentation:style-name'] = style['@_style:name'];
          // } else if (style['@_style:family'] === 'paragraph') {
          //   frame['@_draw:text-style-name'] = originalName;
        }
      });

      let str = JSON.stringify(page);
      str = str.replace(
        `"@_draw:text-style-name":"${originalName}"`,
        `"@_draw:text-style-name":"${style['@_style:name']}"`
      );
      str = str.replace(
        `"@_text:style-name":"${originalName}"`,
        `"@_text:style-name":"${style['@_style:name']}"`
      );
      page = JSON.parse(str);
      set(doc, `${drawPageKey}.${index}`, page);
    });
  });
}
