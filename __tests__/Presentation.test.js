import Presenation from '../src/Presentation';

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

  describe('.changeKeyReferences', () => {
    it.todo('changes the references of styles to be unique');
  });
});
