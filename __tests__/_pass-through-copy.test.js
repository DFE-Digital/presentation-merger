import path from 'path';
import fs from 'fs';
import decompress from 'decompress';
import { format } from 'prettier';
import Merger from '../src/Merger';
import Document from '../src/Document';

async function mergeFiles(files, outPath) {
  const stream = fs.createWriteStream(outPath, { flags: 'w' });
  const doc = new Document();
  for (let file of files) {
    await doc.mergeFile(file);
  }
  return doc.pipe(stream);
}

function fmt(xml) {
  return format(xml, {
    xmlSelfClosingSpace: true,
    xmlWhitespaceSensitivity: 'ignore',
    parser: 'xml'
  });
}

describe('PassThroughCopy', () => {
  let generatedXML;
  let contentXML;
  let stylesXML;
  beforeEach(async () => {
    let files = await decompress(
      path.join(__dirname, '__fixtures__/samples1/pres1.odp')
    );
    contentXML = fmt(files.find(f => f.path === 'content.xml').data.toString());
    stylesXML = fmt(files.find(f => f.path === 'styles.xml').data.toString());
  });

  it('copies the content of content.xml as to the output as expected', () => {
    let doc = new Merger('content', []);
    doc.merge(contentXML);
    generatedXML = doc.toXml(true);
    expect(generatedXML).toMatchSnapshot();
  });

  // eslint-disable-next-line jest/expect-expect
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('copies the content of content.xml integrated', async () => {
    let dirname = path.join(__dirname, '__fixtures__/samples1');

    let outFile = path.join(dirname, 'output.odp');

    await mergeFiles(
      // [path.join(dirname, 'pres1.odp')], //, path.join(dirname, 'pres2.odp')],
      [path.join(dirname, 'pres1.odp'), path.join(dirname, 'pres2.odp')],
      outFile
    );
    let files = await decompress(outFile);
    let generatedContentXML = fmt(
      files.find(f => f.path === 'content.xml').data.toString()
    );
    let generatedStylesXML = fmt(
      files.find(f => f.path === 'styles.xml').data.toString()
    );
    expect(generatedContentXML).toEqual(contentXML);
    expect(generatedStylesXML).toEqual(stylesXML);
  });
});
