import path from 'path';
import decompress from 'decompress';
import { toJson } from 'xml2json';
import Style from '../src/Style';

describe('Style', () => {
  let subject;
  beforeEach(async () => {
    const files = await decompress(
      path.join(__dirname, '__fixtures__/file1.odp')
    );
    const masterStylesFile = files.find(f => f.path === 'styles.xml');
    subject = new Style(JSON.parse(toJson(masterStylesFile.data)));
  });

  describe('namespaces', () => {
    it('returns the style XML namespaces for this presentation', () => {
      expect(subject.namespaces).toMatchSnapshot();
    });
  });
});
