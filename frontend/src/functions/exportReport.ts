export type ExportColumn<T> = {
  header: string;
  value: (row: T) => string | number;
  width?: number;
};

export type ExportOptions<T> = {
  fileName: string;
  title: string;
  subtitle?: string;
  columns: ExportColumn<T>[];
  rows: T[];
};

const BRAND_GREEN = "16302A";

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

export const exportToExcel = async <T>({
  fileName,
  title,
  subtitle,
  columns,
  rows,
}: ExportOptions<T>) => {
  const { default: ExcelJS } = await import("exceljs");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Versatti";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title.slice(0, 31));

  sheet.addRow([title]).font = { bold: true, size: 14 };
  if (subtitle) {
    sheet.addRow([subtitle]).font = { color: { argb: "FF6B7A73" } };
  }
  sheet.addRow([]);

  const headerRow = sheet.addRow(columns.map((column) => column.header));
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${BRAND_GREEN}` },
    };
    cell.alignment = { vertical: "middle" };
  });

  rows.forEach((row) =>
    sheet.addRow(columns.map((column) => column.value(row))),
  );

  columns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width ?? 20;
  });

  sheet.views = [{ state: "frozen", ySplit: headerRow.number }];

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${fileName}.xlsx`,
  );
};

export const exportToPdf = async <T>({
  fileName,
  title,
  subtitle,
  columns,
  rows,
}: ExportOptions<T>) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFontSize(16);
  doc.setTextColor(18, 35, 28);
  doc.text(title, 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(107, 122, 115);
  doc.text(
    `${subtitle ? `${subtitle} · ` : ""}Gerado em ${new Date().toLocaleString("pt-BR")}`,
    40,
    58,
  );

  autoTable(doc, {
    startY: 72,
    head: [columns.map((column) => column.header)],
    body: rows.map((row) => columns.map((column) => String(column.value(row)))),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [22, 48, 42], textColor: 255 },
    alternateRowStyles: { fillColor: [247, 249, 248] },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      const page = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(107, 122, 115);
      doc.text(
        `Versatti · página ${page}`,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 20,
        { align: "right" },
      );
    },
  });

  doc.save(`${fileName}.pdf`);
};
