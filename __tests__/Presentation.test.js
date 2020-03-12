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
    beforeEach(() => {
      subject.doc = {
        'office:document-content': {
          'office:automatic-styles': {
            'style:style': [
              {
                '@_style:name': 'dp1',
                '@_style:family': 'drawing-page'
              },
              {
                '@_style:name': 'pr1',
                '@_style:family': 'presentation'
              },
              {
                '@_style:name': 'P1',
                '@_style:family': 'paragraph'
              }
            ]
          },
          'office:body': {
            'office:presentation': {
              'draw:page': [
                {
                  '@_draw:name': 'page1',
                  '@_draw:style-name': 'dp1',
                  '@_presentation:presentation-page-layout-name': 'ALT2T1',
                  'draw:frame': [
                    {
                      '@_presentation:style-name': 'pr1',
                      '@_draw:text-style-name': 'P1',
                      'draw:text-box': [
                        {
                          'text:p': {
                            '@_text:style-name': 'P1'
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }
      };
    });
    it('changes the references of styles to be unique', () => {
      subject.id = 0;
      subject.changeKeyReferences(subject.doc);
      expect(subject.doc).toHaveProperty(
        'office:document-content.office:automatic-styles.style:style.0.@_style:name',
        '0-dp1'
      );

      expect(subject.doc).toHaveProperty(
        'office:document-content.office:automatic-styles.style:style.1.@_style:name',
        '0-pr1'
      );

      expect(subject.doc).toHaveProperty(
        'office:document-content.office:body.office:presentation.draw:page.0.@_draw:style-name',
        '0-dp1'
      );

      expect(subject.doc).toHaveProperty(
        'office:document-content.office:body.office:presentation.draw:page.0.draw:frame.0.@_presentation:style-name',
        '0-pr1'
      );

      expect(subject.doc).toHaveProperty(
        'office:document-content.office:body.office:presentation.draw:page.0.draw:frame.0.@_draw:text-style-name',
        '0-P1'
      );

      expect(subject.doc).toHaveProperty(
        'office:document-content.office:body.office:presentation.draw:page.0.draw:frame.0.draw:text-box.0.text:p.@_text:style-name',
        '0-P1'
      );
    });
  });
});
