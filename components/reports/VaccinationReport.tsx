"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Data types for the report rows
export type VaccinationReportRow = {
  vaccination: string;
  unit: number | string;
  rate: string;
  totalAmount: string;
  nprAmount: string;
};

export type VaccinationReportProps = {
  orgName: string;
  orgSub: string;
  orgAddress: string;
  orgPhone: string;
  title?: string;
  dateRange: string;
  reportDate: string;
  rows: VaccinationReportRow[];
  totalUsd: string;
  totalNpr: string;
};

export default function VaccinationReport({
  orgName,
  orgSub,
  orgAddress,
  orgPhone,
  title = "Summary of Vaccination",
  dateRange,
  reportDate,
  rows,
  totalUsd,
  totalNpr,
}: VaccinationReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // Print
  const handlePrint = () => {
    if (!reportRef.current) return;
    const printContents = reportRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      // Copy styles from current document
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("");
          } catch (e) {
            console.warn("Could not access stylesheet:", styleSheet, { e });
            return ""; // Ignore cross-origin stylesheets
          }
        })
        .join("");

      printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            ${styles}
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      setTimeout(() => printWindow.close(), 500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10">
      {/* Action buttons */}
      <div className="mb-4 flex gap-4 justify-end no-print">
        <Button variant="secondary" onClick={handlePrint}>
          Print or Download PDF
        </Button>
      </div>

      {/* The printable/report content */}
      <div
        ref={reportRef}
        className="bg-white shadow-lg rounded-lg p-8 font-serif text-[15px]"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/iom-logo.svg"
            alt="Org Logo"
            className="mb-4"
            width={248}
            height={248}
          />
          <div className="text-center">
            <h2 className="font-bold text-lg leading-tight">{orgName}</h2>
            <div className="font-medium">{orgSub}</div>
            <div className="text-sm">
              {orgAddress}
              <br />
              {orgPhone}
            </div>
          </div>
        </div>
        {/* Title */}
        <h3 className="font-bold text-center text-lg mb-2 underline underline-offset-2">
          {title}
        </h3>
        {/* Date Range Row */}
        <div className="flex justify-between mb-2">
          <span>NPR Income at MHAC Date Range:</span>
          <span className="font-semibold">{dateRange}</span>
        </div>
        {/* Table Header */}
        <div className="border-y-2 border-blue-900 py-2 font-semibold text-blue-900 grid grid-cols-6 gap-2 text-sm">
          <div>BillDate by Day</div>
          <div>Vaccination</div>
          <div>Unit #</div>
          <div>Rate</div>
          <div>Total Amount</div>
          <div>NPR Amount</div>
        </div>
        <div className="py-2 grid grid-cols-6 gap-2 text-sm text-gray-900 border-b border-blue-900">
          {/* "Friday, September 5, 2025" full row */}
          <div className="col-span-6 font-semibold text-lg py-1">
            {reportDate}
          </div>
          {/* Data rows */}
          {rows.map((row, idx) => (
            <React.Fragment key={idx}>
              <div></div>
              <div>{row.vaccination}</div>
              <div>{row.unit}</div>
              <div>{row.rate}</div>
              <div>{row.totalAmount}</div>
              <div>{row.nprAmount}</div>
            </React.Fragment>
          ))}
        </div>
        {/* Totals */}
        <div className="flex justify-end border-t-2 border-blue-900 py-2 mt-4 ">
          <div className="flex flex-col items-end space-y-1 mr-30">
            <div className="text-blue-900 font-bold text-base">
              Total Collection:
              <span className="ml-10 text-black font-semibold">{totalUsd}</span>
              <span className="ml-20 text-black font-semibold">{totalNpr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
