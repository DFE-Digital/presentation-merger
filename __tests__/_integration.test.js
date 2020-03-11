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

describe('Integration', () => {
  it('merges "samples1/pres1.odp" and "samples1/pres2.odp"', async () => {
    let dirname = path.join(__dirname, '__fixtures__/samples1');
    let outFile = path.join(dirname, 'output.odp');

    let zip = await mergeFiles(
      [path.join(dirname, 'pres1.odp'), path.join(dirname, 'pres2.odp')],
      outFile
    );
    expect(fs.existsSync(outFile)).toBeTruthy();
    await checkIntegrity(zip);
  });
});
