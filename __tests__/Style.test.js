import path from 'path';
import decompress from 'decompress';
import { toJson } from 'xml2json';
import Style from '../src/Style';
import Presentation from '../src/Presentation';

describe('Style', () => {
  let subject;
  let presentation;
  beforeEach(async () => {
    const files = await decompress(
      path.join(__dirname, '__fixtures__/file1.odp')
    );
    const masterStylesFile = files.find(f => f.path === 'styles.xml');
    const contentFile = files.find(f => f.path === 'content.xml');
    presentation = new Presentation(JSON.parse(toJson(contentFile.data)));
    subject = new Style(
      JSON.parse(toJson(masterStylesFile.data)),
      presentation
    );
  });
  describe('masterPages', () => {
    it('returns master styles for the presenation', () => {
      expect(subject.masterPages).toMatchSnapshot();
    });
  });

  describe('presentationPageLayouts', () => {
    it('returns layouts for the presentation', () => {
      expect(subject.presentationPageLayouts).toMatchSnapshot();
    });
  });

  describe('namespaces', () => {
    it('returns the style XML namespaces for this presentation', () => {
      expect(subject.namespaces).toMatchSnapshot()
    });
  });

  describe('styles', () => {
    it.skip('returns styles for the presentation slides', () => {
      expect(subject.styles).toMatchSnapshot();
    });
  });
});
