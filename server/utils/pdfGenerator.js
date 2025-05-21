const PDFDocument = require("pdfkit");
require("pdfkit-table");
const axios = require("axios");

const generateReportPDF = async ({ startDate, endDate, reportType, data }) => {
  const doc = new PDFDocument({ margin: 30, size: "A4" });
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));

  // Fonts
  const headerFont = "Helvetica-Bold";
  const bodyFont = "Helvetica";
  const titleFontSize = 20;
  const subtitleFontSize = 12;
  const tableHeaderFontSize = 12;
  const tableRowFontSize = 10;

  // Header function (called on first page and optionally others)
  const addHeader = () => {
    doc.font(headerFont).fontSize(titleFontSize).text("CeylonianTour", 30, 30);
    doc
      .font(bodyFont)
      .fontSize(subtitleFontSize)
      .text("Travel & Tour Management System", 30, 50);

    // Logo placeholder - Replace this with your logo
    doc
      .font(bodyFont)
      .fontSize(subtitleFontSize)
      .text("[CeylonianTour Logo]", 400, 30, { align: "right" });

    const path = require("path");

    doc.image(
      path.join(__dirname, "/ceyloniantour_logo.jpg"),
      400,
      30,
      {
        width: 100, // Adjust width to fit your logo
        align: "right",
      }
    );

    // Positioning Tips:
    // - The coordinates (400, 30) place the logo at the top-right (x: 400, y: 30).
    // - Adjust 'width' to scale your logo (e.g., 100 points).
    // - If the logo is too large, adjust the position (e.g., 380, 20) or size (e.g., width: 80).
    // - If using a URL, ensure generateReportPDF is called within an async context and handle errors.

    // Report title
    doc
      .font(headerFont)
      .fontSize(16)
      .text(`${reportType.toUpperCase()} Report`, 30, 80, { align: "center" });

    // Date range and generated date
    const generatedDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    doc
      .font(bodyFont)
      .fontSize(subtitleFontSize)
      .text(`From: ${startDate} To: ${endDate}`, 30, 110);
    doc.text(`Generated on: ${generatedDate}`, 30, 125);

    // Horizontal line
    doc.moveTo(30, 140).lineTo(565, 140).stroke();
    doc.moveDown(2);
  };

  // Footer with page numbers
  const addFooter = (pageNumber, totalPages) => {
    doc
      .font(bodyFont)
      .fontSize(10)
      .text(`Page ${pageNumber} of ${totalPages}`, 30, doc.page.height - 50, {
        align: "center",
      });
  };

  // Add header on first page
  addHeader();

  // Chart using QuickChart
  doc
    .font(headerFont)
    .fontSize(14)
    .text("Data Visualization", { align: "left" });
  doc.moveDown(0.5);

  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: data.map((d) => d.date),
        datasets: [
          {
            label: reportType.charAt(0).toUpperCase() + reportType.slice(1),
            data: data.map((d) => d[reportType.toLowerCase()] ?? 0),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    })
  )}`;

  try {
    const chartResponse = await axios.get(chartUrl, {
      responseType: "arraybuffer",
    });
    doc.image(chartResponse.data, 50, doc.y, {
      fit: [495, 300],
      align: "center",
    });
  } catch (error) {
    doc.text("Chart could not be loaded due to an error.", { align: "center" });
  }

  // Check if there's enough space for the first table, else add new page
  if (doc.y > doc.page.height - 150) {
    doc.addPage();
  } else {
    doc.moveDown(2);
  }

  // Table configuration
  const tableData = {
    title: "Report Summary",
    subtitle: `Summary of ${reportType} from ${startDate} to ${endDate}`,
    headers: ["Date", reportType.charAt(0).toUpperCase() + reportType.slice(1)],
    rows: data.map((entry) => [
      entry.date,
      entry[reportType.toLowerCase()]?.toString() ?? "N/A",
    ]),
  };

  // Table styling
  const tableOptions = {
    prepareHeader: () => doc.font(headerFont).fontSize(tableHeaderFontSize),
    prepareRow: () => doc.font(bodyFont).fontSize(tableRowFontSize),
    padding: 5,
    columnSpacing: 10,
    width: 505,
    columnsSize: [150, 355],
  };

  // Add first table (below chart)
  doc.font(headerFont).fontSize(14).text("Summary Table", { align: "left" });
  doc.moveDown(0.5);
  doc.table(tableData, tableOptions);

  // Check if there's enough space for the second table, else add new page
  if (doc.y > doc.page.height - 150) {
    doc.addPage();
  } else {
    doc.moveDown(2);
  }

  // Add second table (after first table)
  doc
    .font(headerFont)
    .fontSize(14)
    .text("Detailed Data Table", { align: "left" });
  doc.moveDown(0.5);
  doc.table(tableData, tableOptions);

  // Add page numbers
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    addFooter(i + 1, totalPages);
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};

module.exports = generateReportPDF;
