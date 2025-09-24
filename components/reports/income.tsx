"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export type IncomeReportRow = {
  type: string;
  billNo: string | number;
  billDate: string;
  paFullName: string;
  amount: string;
  nprAmount: string;
  gl: string | number;
};

export type IncomeReportProps = {
  orgName: string;
  orgSub: string;
  orgAddress: string;
  orgPhone: string;
  title?: string;
  dateRange: string;
  wbsCountry?: string;
  reportDate: string;
  rows: IncomeReportRow[];
  totalUsd: string;
  totalNpr: string;
  cashierName: string;
  exchangeRate: string;
};

export function IncomeReport({
  orgName,
  orgSub,
  orgAddress,
  orgPhone,
  title = "Summary of Income",
  dateRange,
  wbsCountry,
  reportDate,
  rows,
  totalUsd,
  totalNpr,
  cashierName,
  exchangeRate,
}: IncomeReportProps) {
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
    <div className="mx-auto mt-10">
      {/* Action buttons */}
      <div className="mb-4 flex gap-4 justify-end no-print">
        <Button variant="outline" onClick={handlePrint}>
          Print or Download PDF
        </Button>
      </div>

      {/* Report */}
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
        <div className="border-y-2 border-blue-900 py-2 font-semibold text-blue-900 grid grid-cols-8 gap-2 text-sm">
          <div className="col-span-2">BillDate by Day</div>
          <div>Type</div>
          <div>BillNo</div>
          <div>BillDate</div>
          <div className="col-span-2">PA_FullName</div>
          <div>Amount</div>
          <div>NPR Amount</div>
          <div>GL</div>
        </div>
        {/* Table Data */}
        <div className="py-2 grid grid-cols-8 gap-2 text-sm text-gray-900 border-b border-blue-900">
          <div className="col-span-8 font-semibold text-lg py-1">
            {reportDate}
          </div>
          {wbsCountry && (
            <div className="col-span-8 font-medium text-blue-900">
              WBS / Country: {wbsCountry}
            </div>
          )}
          {rows.map((row, idx) => (
            <React.Fragment key={idx}>
              <div></div>
              <div>{row.billNo}</div>
              <div>{row.billDate}</div>
              <div className="col-span-2">{row.paFullName}</div>
              <div>{row.amount}</div>
              <div>{row.nprAmount}</div>
              <div>{row.gl}</div>
            </React.Fragment>
          ))}
        </div>
        {/* Totals */}
        <div className="flex justify-end border-t-2 border-blue-900 py-2 mt-2">
          <div className="flex flex-col items-end space-y-1">
            <div className="text-blue-900 font-bold text-base">
              Total Collection:
              <span className="ml-4 text-black font-semibold">{totalUsd}</span>
              <span className="ml-4 text-black font-semibold">{totalNpr}</span>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-8 flex justify-between items-center">
          <div className="flex flex-col items-center">
            <div className="font-semibold">{cashierName}</div>
            <div className="border-t border-black w-32 text-center text-xs mt-1">
              Cashier Name
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="border-t border-black w-32 text-center text-xs mt-5">
              Signature
            </div>
          </div>
        </div>
        {/* Exchange Rate */}
        <div className="text-xs mt-4 italic">
          *Exchange Rate - <span className="font-bold">{exchangeRate}</span>
        </div>
      </div>
    </div>
  );
}

export default IncomeReport;
