import Merger from '../src/Merger';
import Presentation from '../src/Presentation';
import Style from '../src/Style';

describe('Merger', () => {
  let subject;
  const xml = `<office:document-content xmlns:officeooo="http://openoffice.org/2009/office">
  <office:body>
    <office:presentation>
      <draw:page draw:name="page1"/>
      <draw:page draw:name="page2"/>
    </office:presentation>
  </office:body>
</office:document-content>`;
  beforeEach(() => {
    subject = new Merger('content');
  });

  it('throws an error when initialized with a unknown type', () => {
    expect(() => {
      new Merger();
    }).toThrowErrorMatchingSnapshot();
  });

  describe('.parserOptions', () => {
    it('has default options', () => {
      expect(subject.parserOptions).toMatchObject({
        attributeNamePrefix: '@_',
        attrNodeName: false,
        ignoreAttributes: false,
        ignoreNameSpace: false,
        arrayMode: true
      });
    });
  });

  describe('.merge(xml)', () => {
    it('merges the provided XML content to the doc object', () => {
      subject.merge(xml);
      expect(subject.doc).toMatchSnapshot();
      expect(
        subject[
          'office:document-content.office:body.office:presentation.draw:page'
        ]
      ).toMatchSnapshot();
    });

    it('appends the selected XML keys to the document sets', () => {
      subject.merge(xml);
      subject.merge(xml);
      expect(subject.doc).toMatchSnapshot();
      expect(
        subject[
          'office:document-content.office:body.office:presentation.draw:page'
        ]
      ).toMatchSnapshot();
    });
  });

  describe('.toObj(xml)', () => {
    it('converts the XML to a JavaScript object via Presentation class', () => {
      expect(subject.toObj(xml)).toBeInstanceOf(Presentation);
    });

    it('converts the XML to a JavaScript object via Styles class', () => {
      subject = new Merger('styles');
      expect(subject.toObj(xml)).toBeInstanceOf(Style);
    });

    it('throws an error when initialized with a unknown type', () => {
      subject.type = 'something';
      expect(() => {
        subject.toObj(xml);
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('.toXml(formatted)', () => {
    it('converts the doc object to XML', () => {
      subject.doc = {
        'office:document-content': {
          'office:body': {
            'office:presentation': { 'draw:page': [{ '@_draw:name': 'page1' }] }
          }
        }
      };
      expect(subject.toXml()).toMatchSnapshot();
    });

    it('converts doc object to XML without formatting', () => {
      subject.doc = {
        'office:document-content': {
          'office:body': {
            'office:presentation': { 'draw:page': [{ '@_draw:name': 'page1' }] }
          }
        }
      };
      expect(subject.toXml(false)).toMatchSnapshot();
    });
  });
});
