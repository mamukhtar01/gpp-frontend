"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { UKTBDataDisplay } from "@/components/custom/uktb-data-display";
import { parseExcelFile } from "@/lib/excel";
import { uploadUKTBCases } from "@/app/server_actions";
import Link from "next/link";

interface UploadResult {
  id: string;
  success: boolean;
  error?: string;
}

export default function UploadUKTBCasesPage() {
  const [open, setOpen] = React.useState(false);
  const [excelData, setExcelData] = React.useState<{
    headers: string[];
    rows: unknown[][];
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [uploadResults, setUploadResults] = React.useState<UploadResult[] | null>(null);
  const [showTable, setShowTable] = React.useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadResults(null);
    setShowTable(true);
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const data = await parseExcelFile(file);
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

  const handleFileUpload = async () => {
    if (!excelData) {
      setError("No data to upload");
      return;
    }
    setLoading(true);
    setError(null);
    setUploadResults(null);
    setShowTable(false); // Hide the table on upload
    try {
      const results: UploadResult[] = await uploadUKTBCases(excelData.rows as string[][]);
      setUploadResults(results);

      // Always reset form after upload
      setExcelData(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError(null);

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Failed to upload data. Please try again. ${error.message}`);
      } else {
        setError(`Failed to upload data. Please try again. ${String(error)}`);
      }
      setUploadResults(null);
    } finally {
      setLoading(false);
    }
  };

  const uploadedIds = uploadResults?.filter(r => r.success).map(r => r.id) ?? [];
  const duplicateIds = uploadResults?.filter(r => !r.success && r.error === "Duplicate ID").map(r => r.id) ?? [];
  const otherErrors = uploadResults?.filter(r => !r.success && r.error !== "Duplicate ID") ?? [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-4">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2 tracking-tight drop-shadow-sm flex items-center gap-3 justify-center">
          <span className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Upload UKTB Cases
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-center">
          <label className="block w-full sm:w-auto">
            <span className="block text-base font-medium text-gray-700 mb-2">
              Select Excel file (.xlsx, .xls)
            </span>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="file:bg-blue-50 file:text-blue-700 file:font-semibold file:border-0 file:rounded file:px-4 file:py-2 file:mr-4 file:cursor-pointer file:transition-colors hover:file:bg-blue-100"
            />
          </label>
        </div>
        {/* Loading indicator */}
        {loading && (
          <div className="mb-4 flex flex-col items-center justify-center">
            <span className="text-blue-700 font-semibold text-lg animate-pulse">
              Uploading cases, please wait...
            </span>
            <div className="mt-2 flex justify-center">
              <svg className="animate-spin h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          </div>
        )}
        {/* Error message */}
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

        {/* Table preview after successful Excel parsing */}
        {excelData && showTable && (
          <UKTBDataDisplay
            excelData={excelData}
            onReset={() => {
              setExcelData(null);
              setError(null);
              setUploadResults(null);
              setShowTable(false);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            onUpload={handleFileUpload}
            loading={loading}
            open={open}
            setOpen={setOpen}
          />
        )}

        {/* Upload results display */}
        {uploadResults && (
          <div className="mb-6 flex flex-col gap-4">
            {/* Uploaded IDs in highly visible green */}
            {uploadedIds.length > 0 && (
              <div className="px-4 py-3 rounded text-base font-bold text-center bg-green-100 text-green-900 border-2 border-green-600 shadow-lg">
                <span className="text-xl font-extrabold text-green-800">✔ Uploaded Cases:</span>
                <div className="mt-2">
                  <span className="text-green-700">{uploadedIds.join(", ")}</span>
                </div>
              </div>
            )}
            {/* Duplicate IDs in highly visible red */}
            {duplicateIds.length > 0 && (
              <div className="px-4 py-3 rounded text-base font-bold text-center bg-red-100 text-red-900 border-2 border-red-600 shadow-lg">
                <span className="text-xl font-extrabold text-red-800">✘ Duplicate IDs (already exist):</span>
                <div className="mt-2">
                  <span className="text-red-700">{duplicateIds.join(", ")}</span>
                </div>
              </div>
            )}
            {/* Other errors in highly visible orange */}
            {otherErrors.length > 0 && (
              <div className="px-4 py-3 rounded text-base font-bold text-center bg-orange-100 text-orange-900 border-2 border-orange-600 shadow-lg">
                <span className="text-xl font-extrabold text-orange-800">⚠ Other errors:</span>
                <div className="mt-2">
                  <span className="text-orange-700">
                    {otherErrors.map(e => `[${e.id}]: ${e.error}`).join(", ")}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end">
          <Link href="/uktb-case/register" className="text-blue-600 hover:underline font-semibold">
            Create New Case
          </Link>
        </div>
      </div>
    </div>
  );
}