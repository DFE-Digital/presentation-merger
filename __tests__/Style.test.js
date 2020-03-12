import Style from '../src/Style';
import fixture from './__fixtures__/styles.json';

describe('Style', () => {
  let subject;
  beforeEach(async () => {
    subject = new Style();
  });

  describe('.keys', () => {
    it('returns an array of keys to extract from the document', () => {
      expect(subject.keys).toMatchInlineSnapshot(`
        Array [
          "office:document-styles.office:font-face-decls.style:font-face",
          "office:document-styles.office:styles.draw:gradient",
          "office:document-styles.office:styles.draw:hatch",
          "office:document-styles.office:styles.draw:fill-image",
          "office:document-styles.office:styles.draw:marker",
          "office:document-styles.office:styles.draw:stroke-dash",
          "office:document-styles.office:styles.style:default-style",
          "office:document-styles.office:styles.style:style",
          "office:document-styles.office:automatic-styles.style:page-layout",
          "office:document-styles.office:automatic-styles.style:style",
          "office:document-styles.office:automatic-styles.text:list-style",
          "office:document-styles.office:master-styles.draw:layer-set.draw:layer",
          "office:document-styles.office:master-styles.style:handout-master",
          "office:document-styles.office:master-styles.style:master-page",
        ]
      `);
    });
  });

  describe('.prefixKeys', () => {
    it('returns an array of keys to prefix with id', () => {
      expect(subject.prefixKeys).toMatchInlineSnapshot(`
        Array [
          "@_style:name",
          "@_style:page-layout-name",
          "@_style:parent-style-name",
          "@_draw:style-name",
          "@_draw:text-style-name",
          "@_presentation:style-name",
          "@_presentation:presentation-page-layout-name",
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
