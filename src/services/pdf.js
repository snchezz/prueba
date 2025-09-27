const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

function buildDigest(websiteId, url, captures) {
  if (!captures.length) {
    throw new Error('No hay capturas disponibles para generar el PDF.');
  }
  const directory = path.join(__dirname, '..', '..', 'storage', 'digests', String(websiteId));
  fs.mkdirSync(directory, { recursive: true });
  const filename = `${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.pdf`;
  const filePath = path.join(directory, filename);

  const doc = new PDFDocument({ autoFirstPage: false });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  captures.forEach((capture, index) => {
    const image = fs.readFileSync(capture.image_path);
    doc.addPage({ size: 'A4', margin: 50 });
    doc.fontSize(16).text(`Captura ${index + 1} - ${capture.captured_at}`, { align: 'left' });
    doc.moveDown();
    const maxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const maxHeight = doc.page.height - doc.y - doc.page.margins.bottom;
    doc.image(image, {
      fit: [maxWidth, maxHeight],
      align: 'center',
      valign: 'center'
    });
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { buildDigest };
