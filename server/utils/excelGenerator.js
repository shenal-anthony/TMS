const ExcelJS = require('exceljs');

const generateReportExcel = async ({ startDate, endDate, reportType, data }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${reportType} Report`);

  // Title row
  worksheet.mergeCells('A1:B1');
  worksheet.getCell('A1').value = `${reportType.toUpperCase()} Report`;
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  worksheet.getCell('A1').font = { size: 18, bold: true };

  // Date range
  worksheet.mergeCells('A2:B2');
  worksheet.getCell('A2').value = `From: ${startDate}  To: ${endDate}`;
  worksheet.getCell('A2').alignment = { horizontal: 'center' };
  worksheet.getCell('A2').font = { size: 12 };

  // User ID row (new addition)
  worksheet.addRow([`User ID: ${reportType}`]); // Adjust this as needed to actually use userId

  // Table headers (with bold font)
  worksheet.addRow(['Date', 'Value']).font = { bold: true };
  
  // Table data
  data.forEach(entry => {
    worksheet.addRow([entry.date, entry[reportType.toLowerCase()] ?? 'N/A']);
  });

  // Set column widths
  worksheet.getColumn(1).width = 20;
  worksheet.getColumn(2).width = 20;

  // Return Excel buffer in a promise
  try {
    const excelBuffer = await workbook.xlsx.writeBuffer();
    return excelBuffer;
  } catch (err) {
    console.error("Error generating Excel file:", err);
    throw new Error("Error generating Excel file");
  }
};

module.exports = generateReportExcel;
