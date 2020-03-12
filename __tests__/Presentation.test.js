import Presenation from '../src/Presentation';
import fixture from './__fixtures__/content.json';

describe('Presentation', () => {
  let subject;
  beforeEach(() => {
    subject = new Presenation();
  });

  describe('.keys', () => {
    it('returns an array of keys to extract from the document', () => {
      expect(subject.keys).toMatchInlineSnapshot(`
        Array [
          "office:document-content.office:scripts",
          "office:document-content.office:font-face-decls.style:font-face",
          "office:document-content.office:automatic-styles.style:style",
          "office:document-content.office:automatic-styles.text:list-style",
          "office:document-content.office:automatic-styles.number:date-style",
          "office:document-content.office:body.office:presentation.draw:page",
        ]
      `);
    });
  });

  describe('.prefixKeys', () => {
    it('returns an array of keys to prefix with id', () => {
      expect(subject.prefixKeys).toMatchInlineSnapshot(`
        Array [
          "@_style:name",
          "@_style:parent-style-name",
          "@_presentation:style-name",
          "@_presentation:presentation-page-layout-name",
          "@_draw:style-name",
          "@_draw:text-style-name",
          "@_draw:master-page-name",
          "@_text:style-name",
        ]
      `);
    });
  });

  describe('.changeKeyReferences', () => {
    beforeEach(() => {
      subject.doc = fixture;
    });

    it('changes the references of styles to be unique', () => {
      subject.id = 0;
      let actual = subject.changeKeyReferences(subject.doc);
      expect(actual).toMatchSnapshot();
    });
  });
});
