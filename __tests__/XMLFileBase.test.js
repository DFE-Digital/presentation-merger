import XMLFileBase from '../src/XMLFileBase';
import fixture from './__fixtures__/content.json';
import fs from 'fs';
import path from 'path';

describe('XMLFileBase', () => {
  let subject;
  beforeEach(() => {
    subject = new XMLFileBase();
  });

  describe('.namespaces', () => {
    it('extracts namespace key/pairs for the XML document', () => {
      subject.rootKey = 'office:document-content';
      jest.spyOn(subject, 'data', 'get').mockReturnValue(fixture);
      expect(subject.namespaces).toMatchSnapshot();
    });
  });

  describe('.data', () => {
    it('converts the XML to object notation', () => {
      subject.xml = fs
        .readFileSync(path.join(__dirname, '__fixtures__/content.xml'))
        .toString();
      let actual = subject.data;
      expect(actual).toEqual(fixture);
    });
  });

  describe('.content', () => {
    it('returns optimised content with pre-processors', () => {
      jest.spyOn(subject, 'data', 'get').mockReturnValue(fixture);
      expect(subject.content).toMatchSnapshot();
    });
  });

  describe('.changeKeyReferences', () => {
    it('replaces references of styles with the updated reference', () => {
      let given = { 'hello:world': 'prefixme' };
      jest.spyOn(subject, 'prefixKeys', 'get').mockReturnValue(['hello:world']);
      subject.id = 0;
      let actual = subject.changeKeyReferences(given);
      expect(actual).toEqual({ 'hello:world': '0-prefixme' });
    });
  });
});
