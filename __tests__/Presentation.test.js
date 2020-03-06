import fs from 'fs';
import path from 'path';
import Presenation from '../src/Presentation';

const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, '__fixtures__/example.json'))
);

describe('Presentation', () => {
  describe('.uniqueStyleIDs()', () => {
    it('renames style names with a prefixed ID', () => {
      let subject = new Presenation(fixture, 0);
      expect(JSON.stringify(subject.data)).toContain(
        '"text:style-name":"0-a1219"'
      );
    });
  });
});
