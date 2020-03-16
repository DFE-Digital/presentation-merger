import fs from 'fs';
import path from 'path';
import Document from '../src/Document';
import JSZip from 'jszip';

describe('Document', () => {
  let subject;
  beforeEach(async () => {
    subject = new Document();
  });

  describe('.manifestFilesInitial', () => {
    it('returns an array of default entities in the manifest', () => {
      expect(subject.manifestFilesInitial).toMatchSnapshot();
    });
  });

  describe('.mergeFile(file)', () => {
    it('merges the given file into the single document', async () => {
      await subject.mergeFile(
        path.join(__dirname, '__fixtures__/samples0/pres1.odp')
      );
      expect(subject.manifestFiles).toMatchSnapshot();
      expect(subject.content).toMatchSnapshot();
      expect(subject.styles).toMatchSnapshot();
      expect(subject.counter).toEqual(1);
    });
  });

  describe('.ZIPOptions', () => {
    it('returns default options for JSZip', () => {
      expect(subject.ZIPOptions).toMatchSnapshot();
    });
  });

  describe('.pipe(stream)', () => {
    let tmpfile = './tmpfile';
    beforeEach(() => {
      subject._zipFiles = jest.fn().mockImplementation(() => {
        const zip = new JSZip();
        return zip;
      });
    });

    afterEach(() => {
      fs.unlinkSync(tmpfile);
    });

    it('successfully resolves', () => {
      let stream = fs.createWriteStream(tmpfile);
      return subject.pipe(stream).then(zip => {
        expect(zip).toBeInstanceOf(JSZip);
      });
    });

    it('handles error', async () => {
      expect.assertions(2);
      let stream = fs.createWriteStream(tmpfile);
      stream.destroy();
      subject.on('error', err => {
        expect(err).toMatchInlineSnapshot(
          `[Error: Cannot call write after a stream was destroyed]`
        );
      });
      return subject.pipe(stream).catch(e => {
        expect(e).toMatchInlineSnapshot(
          `[Error: Cannot call write after a stream was destroyed]`
        );
      });
    });
  });

  describe('._zipFiles()', () => {
    it('returns a JSZip containing files', () => {
      subject.manifest.files = [{ path: '/test', data: 'empty' }];
      let actual = subject._zipFiles();
      expect(actual).toBeInstanceOf(JSZip);
      expect(Object.keys(actual.files)).toMatchSnapshot();
    });
  });
});
