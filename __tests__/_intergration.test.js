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
  doc.pipe(stream);
  return new Promise((done, fail) => {
    doc.on('end', done);
    doc.on('error', fail);
  });
}

describe('Intergration', () => {
  it('Merges two documents together into one document', async () => {
    const filePath = path.join(__dirname, '__fixtures__/output.odp');

    await mergeFiles(
      [
        path.join(__dirname, '__fixtures__/file1.odp'),
        path.join(__dirname, '__fixtures__/file2.odp')
      ],
      filePath
    );

    const files = await decompress(filePath);

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
  });
});
