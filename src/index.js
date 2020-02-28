import Document from './Document';
export default async function mergeFile(stream, files) {
  const doc = new Document();
  for(let file of files) {
    await doc.mergeFile(file)
  }
  doc.pipe(stream)
  return new Promise((resolve, reject) => {
    doc.on('end', resolve)
    doc.on('error', reject)
  })
}
