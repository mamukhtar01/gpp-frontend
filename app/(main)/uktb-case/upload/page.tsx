"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { UKTBDataDisplay } from "@/components/custom/uktb-data-display";
import { parseExcelFile } from "@/lib/excel";
import { uploadUKTBCases } from "@/app/server_actions";
import Link from "next/link";

export default function UploadUKTBCasesPage() {
  // Modal open state for upload confirmation
  const [open, setOpen] = React.useState(false);
  // Upload result message (success or error)
  const [uploadResult, setUploadResult] = React.useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);

  // Holds the parsed Excel data (headers and rows)
  const [excelData, setExcelData] = React.useState<{
    headers: string[];
    rows: unknown[][];
  } | null>(null);
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

  const handleFileUpload = async () => {
    if (!excelData) {
      setError("No data to upload");
      return;
    }
    try {
      setLoading(true);
      setUploadResult(null);
      const data = await uploadUKTBCases(excelData.rows as string[][]);
      if (!data) throw new Error("No data returned");
      setUploadResult({ type: "success", message: "Upload successful!" });
      setExcelData(null); // Clear data after successful upload
    } catch (error) {
      setUploadResult({
        type: "error",
        message: `Failed to upload data. Please try again. ${error}`,
      });
      setError(`Failed to upload data. Please try again. ${error}`);
    } finally {
      setLoading(false);
    }
  };

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
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="file:bg-blue-50 file:text-blue-700 file:font-semibold file:border-0 file:rounded file:px-4 file:py-2 file:mr-4 file:cursor-pointer file:transition-colors hover:file:bg-blue-100"
            />
          </label>
        </div>
        {/* Loading indicator */}
        {loading && <div className="mb-4 text-blue-600 text-center">Loading...</div>}
        {/* Error message */}
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

        {/* Table preview after successful Excel parsing */}
        {excelData && (
          <UKTBDataDisplay
            excelData={excelData}
            onReset={() => {
              setExcelData(null);
              setError(null);
            }}
            onUpload={handleFileUpload}
            loading={loading}
            open={open}
            setOpen={setOpen}
          />
        )}

        {/* Upload result message */}
        {uploadResult && (
          <div
            className={`mb-6 px-4 py-3 rounded text-base font-medium text-center ${
              uploadResult.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {uploadResult.message}
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
