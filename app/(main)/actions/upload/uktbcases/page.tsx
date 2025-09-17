"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { parseExcelFile } from "@/lib/excel";

export default function UploadUKTBCasesPage() {
  // Holds the parsed Excel data (headers and rows)
  const [excelData, setExcelData] = React.useState<{ headers: string[]; rows: unknown[][] } | null>(null);
  // Holds error messages for user feedback
  const [error, setError] = React.useState<string | null>(null);
  // Loading state for UX
  const [loading, setLoading] = React.useState(false);

  // Handles file input change, parses Excel, and updates state
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const data = await parseExcelFile(file);
      // Basic validation: check headers
      if (!data.headers || data.headers.length < 5) {
        setError("Invalid or empty Excel file. Please check the format.");
        setExcelData(null);
      } else {
        setExcelData({ headers: data.headers, rows: data.rows as unknown[][] });
      }
    } catch {
      setError("Failed to parse Excel file. Please upload a valid .xlsx file.");
      setExcelData(null);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-6 tracking-tight drop-shadow-sm flex items-center gap-3">
        <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Upload UKTB Cases</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </h1>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
        <label className="block">
          <span className="block text-base font-medium text-gray-700 mb-2">Select Excel file (.xlsx, .xls)</span>
          <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="file:bg-blue-50 file:text-blue-700 file:font-semibold file:border-0 file:rounded file:px-4 file:py-2 file:mr-4 file:cursor-pointer file:transition-colors hover:file:bg-blue-100" />
        </label>
      </div>
      {/* Loading indicator */}
      {loading && <div className="mb-4 text-blue-600">Loading...</div>}
      {/* Error message */}
      {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* Table preview after successful Excel parsing */}
      {excelData && (
        <div className="overflow-x-auto border rounded-xl bg-white shadow mb-8 p-6">
          <Table>
            <TableHeader>
              <TableRow>
                {excelData.headers.map((header, idx) => (
                  <TableHead key={idx} className="bg-gray-100 text-gray-800 font-semibold text-base px-4 py-3 border-b border-gray-200 uppercase tracking-wide">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {excelData.rows.map((row, i) => (
                <TableRow key={i} className="hover:bg-gray-50">
                  {excelData.headers.map((_, j) => (
                    <TableCell key={j} className="px-4 py-2 whitespace-nowrap text-sm border-b border-gray-100">{String(row[j] ?? "")}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
            {/* Row count */}
            <span className="text-sm text-gray-600">Rows : <span className="font-semibold">{excelData.rows.length}</span></span>
            <div className="flex gap-2">
              {/* Reset button clears preview and error */}
              <Button variant="outline" onClick={() => { setExcelData(null); setError(null); }}>Reset & Re-upload</Button>
              {/* TODO: Replace alert with actual upload logic */}
              <Button className="" onClick={() => alert("Implement upload to backend here")}>Confirm & Upload</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
