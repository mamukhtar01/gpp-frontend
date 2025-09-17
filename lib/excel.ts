// Utility to parse Excel files in the browser
import * as XLSX from "xlsx";

export function parseExcelFile(file: File): Promise<{ headers: string[]; rows: string[][] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const [headers, ...rows] = json;

      // Find columns that look like dates by header name
      const dateColIndexes = (headers as string[]).map((h, idx) =>
        /date|dob|birth/i.test(h) ? idx : -1
      ).filter(idx => idx !== -1);

      // Convert Excel serial numbers to date strings for date columns
      const fixedRows = rows.map(row => {
        const newRow = [...(row as string[])];
        dateColIndexes.forEach(idx => {
          const val = newRow[idx];
          if (typeof val === "number") {
            // Excel's epoch starts at 1900-01-01
            const jsDate = XLSX.SSF.parse_date_code(val);
            if (jsDate) {
              // Format as yyyy-mm-dd
              const mm = String(jsDate.m).padStart(2, '0');
              const dd = String(jsDate.d).padStart(2, '0');
              newRow[idx] = `${jsDate.y}-${mm}-${dd}`;
            }
          }
        });
        return newRow;
      });

      resolve({ headers: headers as string[], rows: fixedRows });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
