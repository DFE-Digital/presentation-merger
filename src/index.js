import Document from './Document';

/**
 * Merge files into a single document
 *
 * @param {stream.Writeable} stream Write stream to pipe the output to
 * @param {array} files All the files to merge into a single document
 */
export default async function mergeFile(stream, files) {
  const doc = new Document();
  for (let file of files) {
    await doc.mergeFile(file);
  }
  doc.pipe(stream);
  return new Promise((resolve, reject) => {
    doc.on('end', resolve);
    doc.on('error', reject);
  });
}
