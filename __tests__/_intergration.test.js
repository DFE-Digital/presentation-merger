import path from 'path';
import fs from 'fs';
import decompress from 'decompress';
import Document from '../src/Document';

async function mergeFiles(files, outPath) {
  const stream = fs.createWriteStream(outPath, { flags: 'w' });
  const doc = new Document();
  for (let file of files) {
    await doc.mergeFile(file);
  }
  return doc.pipe(stream);
}

async function checkPresentationIntegrity(filePath) {
  const files = await decompress(filePath, 'out');

  expect(files).toContainEqual(
    expect.objectContaining({
      path: 'content.xml',
      type: 'file'
    })
  );

  expect(files).toContainEqual(
    expect.objectContaining({
      path: 'META-INF/manifest.xml',
      type: 'file'
    })
  );

  expect(files).toContainEqual(
    expect.objectContaining({
      path: 'mimetype',
      type: 'file'
    })
  );

  expect(
    files.find(f => f.path === 'META-INF/manifest.xml').data.toString()
  ).toMatchSnapshot();
}

describe('Intergration', () => {
  // eslint-disable-next-line jest/expect-expect
  it('Merges two documents together into one document', async () => {
    let dirname = path.join(__dirname, '__fixtures__');

    const filePath = path.join(dirname, 'output.odp');

    await mergeFiles(
      [path.join(dirname, 'file1.odp'), path.join(dirname, 'file2.odp')],
      filePath
    );
    await checkPresentationIntegrity(filePath);
  });

  describe('issue #4', () => {
    // eslint-disable-next-line jest/expect-expect
    it('merges files successfully', async () => {
      let dirname = path.join(__dirname, '__fixtures__/samples1');
      const filePath = path.join(dirname, 'output.odp');
      await mergeFiles(
        [path.join(dirname, 'pres1.odp'), path.join(dirname, 'pres2.odp')],
        filePath
      );

      await checkPresentationIntegrity(filePath);
      // exec(`open ${filePath}`);
    });
  });
});
