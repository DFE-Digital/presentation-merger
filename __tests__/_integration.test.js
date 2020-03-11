import path from 'path';
import fs from 'fs';
import Document from '../src/Document';

async function mergeFiles(files, outPath) {
  const stream = fs.createWriteStream(outPath, { flags: 'w' });
  const doc = new Document();
  for (let file of files) {
    await doc.mergeFile(file);
  }
  let zip = await doc.pipe(stream);
  return zip;
}

async function checkIntegrity(zip) {
  expect(zip.files).toMatchObject({
    mimetype: expect.any(Object),
    'META-INF/manifest.xml': expect.any(Object),
    'content.xml': expect.any(Object),
    'styles.xml': expect.any(Object)
  });

  const keys = ['META-INF/manifest.xml', 'content.xml', 'styles.xml'];

  for (let path of keys) {
    expect(await zip.file(path).async('string')).toMatchSnapshot();
  }
}

let samples = ['samples0', 'samples1', 'samples2'];

describe('Integration', () => {
  for (let sample of samples) {
    it(`merges "${sample}/pres1.odp" and "${sample}/pres2.odp" to a single presentation`, async () => {
      let dirname = path.join(__dirname, `__fixtures__/${sample}`);
      let outFile = path.join(dirname, 'output.odp');

      let zip = await mergeFiles(
        [path.join(dirname, 'pres1.odp'), path.join(dirname, 'pres2.odp')],
        outFile
      );
      expect(fs.existsSync(outFile)).toBeTruthy();
      await checkIntegrity(zip);
    });
  }
});
