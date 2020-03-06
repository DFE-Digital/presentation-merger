import fs from 'fs';
import path from 'path';
import { get } from 'shvl';
import { toJson } from 'xml2json';
import decompress from 'decompress';
import Presentation from '../src/Presentation';
import Document from '../src/Document';
import Style from '../src/Style';

const fixture1 = JSON.parse(
  fs.readFileSync(path.join(__dirname, '__fixtures__/file1.json'))
);

const fixture2 = JSON.parse(
  fs.readFileSync(path.join(__dirname, '__fixtures__/file2.json'))
);

async function readFixture(filename) {
  const files = await decompress(
    path.join(__dirname, '__fixtures__/' + filename)
  );
  const masterStylesFile = files.find(f => f.path === 'styles.xml');
  const contentFile = files.find(f => f.path === 'content.xml');
  const presentation = new Presentation(JSON.parse(toJson(contentFile.data)));
  const style = new Style(JSON.parse(toJson(masterStylesFile.data)));
  const subject = new Document();
  return {
    presentation,
    style,
    subject
  };
}

describe('Document', () => {
  let subject;
  let style;
  let presentation;
  beforeEach(async () => {
    let obj = await readFixture('file1.odp');
    presentation = obj.presentation;
    style = obj.style;
    subject = obj.subject;
  });

  describe('.manifestFiles', () => {
    it('has a initial set of manifest files that will exist', () => {
      expect(subject.manifestFiles).toContainEqual(
        expect.objectContaining({
          mimeType: 'application/vnd.oasis.opendocument.presentation',
          path: '/',
          version: '1.2'
        })
      );

      expect(subject.manifestFiles).toContainEqual(
        expect.objectContaining({
          mimeType: 'text/xml',
          path: 'content.xml'
        })
      );

      expect(subject.manifestFiles).toContainEqual(
        expect.objectContaining({
          mimeType: 'text/xml',
          path: 'styles.xml'
        })
      );
    });
  });

  describe('.mergeFile', () => {
    let file = path.join(__dirname, '__fixtures__/out1.odp');
    afterEach(() => {
      fs.unlinkSync(file);
    });
    it('prepares files to merge', async () => {
      let doc = new Document();
      await doc.mergeFile(path.join(__dirname, '__fixtures__/file1.odp'));
      await doc.mergeFile(path.join(__dirname, '__fixtures__/file2.odp'));
      let stream = fs.createWriteStream(file, { flags: 'w' });
      doc.pipe(stream);
      return new Promise(done => {
        doc.on('end', async () => {
          const files = await decompress(file);
          let filePaths = files.map(f => f.path);

          expect(filePaths).toContainEqual('content.xml');
          expect(filePaths).toContainEqual(
            'Presentation0-Pictures/100000000000032000000258E080B12F.jpg'
          );

          expect(filePaths).toContainEqual(
            'Presentation0-Pictures/100002010000028200000040779DD47E.png'
          );

          expect(filePaths).toContainEqual(
            'Presentation0-Pictures/1000000000000040000000400142E835.png'
          );
          done();
        });
        doc.on('error', err => {
          throw err;
        });
      });
    });
  });

  describe('.mergeContent', () => {
    it('merges multiple presentations', () => {
      let subject = new Document();

      subject.mergeContent(new Presentation(fixture1, 0));
      subject.mergeContent(new Presentation(fixture2, 1));

      expect(subject.doc).toMatchSnapshot();
    });
  });

  describe('manifest', () => {
    it('returns the correct formatting for mimetype', async () => {
      expect(subject.manifest).toMatchSnapshot();
      await subject.mergeFile(path.join(__dirname, '__fixtures__/file1.odp'));
      expect(subject.manifest).toMatchSnapshot();
    });
  });

  describe('mergeStyles', () => {
    beforeEach(async () => {
      let obj1 = await readFixture('file1.odp');
      subject.mergeStyles(obj1.style, obj1.presentation);
      let obj2 = await readFixture('file2.odp');
      subject.mergeStyles(obj2.style, obj2.presentation);
    });

    it('merges style content from the presentation into the document style', () => {
      subject.mergeStyles(style, presentation);
      expect(subject.stylesDoc).toMatchSnapshot();
    });

    describe('master-page', () => {
      let actual;
      beforeEach(() => {
        let key =
          'office:document-styles.office:master-styles.style:master-page';
        actual = get(subject.stylesDoc, key);
      });

      it('contains the expected master pages', () => {
        expect(actual).toMatchSnapshot();
      });
    });

    describe('office:automatic-styles.style:style', () => {
      let actual;
      beforeEach(() => {
        let key = 'office:document-styles.office:automatic-styles.style:style';
        actual = get(subject.stylesDoc, key);
      });

      it('contains the automatic-styles from both files', () => {
        expect(actual).toMatchSnapshot();
      });
    });
  });

  describe('pipe', () => {
    let tmpfile = './tmpfile';
    beforeEach(() => {
      subject = new Document();
    });
    afterEach(() => {
      fs.unlinkSync(tmpfile);
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
          Error,
          `[Error: Cannot call write after a stream was destroyed]`
        );
      });
    });
  });
});
