const PDFDocument = require('pdfkit');
require('pdfkit-table'); // extends PDFDocument prototype

const axios = require('axios');

const generateReportPDF = async ({ startDate, endDate, reportType, data }) => {
  const doc = new PDFDocument({ margin: 30 });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  // Set title and date range
  doc.fontSize(18).text(`${reportType.toUpperCase()} Report`, { align: 'center' });
  doc.moveDown().fontSize(12).text(`From: ${startDate}  To: ${endDate}`);
  doc.moveDown();

  // Table content
  const tableData = {
    title: 'Report Summary',
    headers: ['Date', 'Value'],
    rows: data.map((entry) => [entry.date, entry[reportType.toLowerCase()] ?? 'N/A']),
  };

  // Use doc.table (pdfkit-table is synchronous, no need to await it)
  doc.table(tableData, { prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12), prepareRow: () => doc.font('Helvetica').fontSize(10) });

  // Chart using QuickChart
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
    type: 'bar',
    data: {
      labels: data.map((d) => d.date),
      datasets: [{
        label: reportType,
        data: data.map((d) => d[reportType.toLowerCase()] ?? 0),
      }],
    },
  }))}`;

  try {
    const chartResponse = await axios.get(chartUrl, { responseType: 'arraybuffer' });
    doc.addPage().image(chartResponse.data, { fit: [500, 300], align: 'center' });
  } catch (error) {
    doc.addPage().text('Chart could not be loaded.', { align: 'center' });
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};

module.exports = generateReportPDF;
