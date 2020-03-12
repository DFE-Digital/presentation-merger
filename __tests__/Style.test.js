import Style from '../src/Style';

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

  describe('.changeKeyReferences', () => {
    it.todo('changes the references of styles to be unique');
  });
});
