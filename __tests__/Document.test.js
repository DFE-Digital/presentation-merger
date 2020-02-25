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

describe('Document', () => {
  let subject;
  let style;
  let presentation;
  beforeEach(async () => {
    const files = await decompress(
      path.join(__dirname, '__fixtures__/file1.odp')
    );
    const masterStylesFile = files.find(f => f.path === 'styles.xml');
    const contentFile = files.find(f => f.path === 'content.xml');
    presentation = new Presentation(JSON.parse(toJson(contentFile.data)));
    style = new Style(JSON.parse(toJson(masterStylesFile.data)), presentation);
    subject = new Document();
  });
  
  describe('.mergeFile', () => {
    it('prepares files to merge', async () => {
      let doc = new Document();
      await doc.mergeFile(path.join(__dirname, '__fixtures__/file1.odp'));
      await doc.mergeFile(path.join(__dirname, '__fixtures__/file2.odp'));
      let stream = fs.createWriteStream(
        path.join(__dirname, '__fixtures__/out1.odp'),
        { flags: 'w' }
      );
      doc.pipe(stream);
      return new Promise(done => {
        doc.on('end', async () => {
          const files = await decompress(
            path.join(__dirname, '__fixtures__/out1.odp'),
            'out'
          );
          let filePaths = files.map(f => f.path);

          expect(filePaths).toContainEqual('content.xml');
          expect(filePaths).toContainEqual(
            'Presentation0/Pictures/100000000000032000000258E080B12F.jpg'
          );

          expect(filePaths).toContainEqual(
            'Presentation0/Pictures/100002010000028200000040779DD47E.png'
          );

          expect(filePaths).toContainEqual(
            'Presentation0/Pictures/1000000000000040000000400142E835.png'
          );
          done();
        });
        doc.on('error', err => {
          throw err;
        });
      });
    });
  });

  describe('.merge', () => {
    it('merges multiple presentations', () => {
      let doc = new Document();
      let fixtures = [fixture1, fixture2];
      let presentations = [];

      fixtures.forEach(fixture => {
        presentations.push(new Presentation(fixture));
      });

      presentations.forEach(pres => {
        doc.merge(pres);
      });

      let slides = get(
        doc.doc,
        'office:document-content.office:body.office:presentation.draw:page'
      );

      fixtures.forEach(fixture => {
        let fixtureSlides = get(
          fixture,
          'office:document-content.office:body.office:presentation.draw:page'
        );
        fixtureSlides.forEach(slide => {
          expect(slides).toContainEqual(slide);
        });
      });
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
    it('merges style content from the presentation into the document style', () => {
      subject.mergeStyles(style, presentation);
      expect(subject.stylesDoc).toMatchSnapshot();
    });
  });
});
