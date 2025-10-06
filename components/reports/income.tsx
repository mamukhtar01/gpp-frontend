"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatReadableDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/fee-utils";
import { useExchangeRate } from "@/app/(main)/payments/exchangeRateContext";

export type IncomeReportRow = {
  service_type: string;
  billNo: string | number;
  amount_in_dollar?: string;
  date_of_payment: string;
  payerInfo: string;
  paidAmount: string;
  amount_in_local_currency: string;
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
  loading?: boolean;
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
  loading,
}: IncomeReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

 // Exchange rate state Context
  const exchangeRate = useExchangeRate();

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
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #1e40af; padding: 4px 8px; }
              th { background: #f1f5f9; }
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
        {/* Table */}
        <div className="overflow-x-auto ">
          <table className="min-w-full border border-blue-900 text-sm">
            <thead className="">
              <tr className="bg-blue-50 text-blue-900 px-3-2 border-b border-blue-900">
                <th>Type</th>
                <th>BillNo</th>
                <th>BillDate</th>
                <th>PA_FullName</th>
                <th>Amount</th>
                <th className="text-right px-2">NPR Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="text-left font-semibold py-2">
                  {reportDate}
                </td>
              </tr>
              {wbsCountry && (
                <tr>
                  <td colSpan={7} className=" text-blue-900 font-bold py-2">
                    WBS / Country: {wbsCountry}
                  </td>
                </tr>
              )}
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    No data available
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="even:bg-slate-50">
                    <td className="pl-3">{row.service_type}</td>
                    <td>{row.billNo}</td>
                    <td>{formatReadableDate(row.date_of_payment)}</td>
                    <td>{row.payerInfo}</td>
                    <td className="text-right">${row.amount_in_dollar}</td>
                    <td className="text-right pr-3">
                      {row.amount_in_local_currency}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Totals */}
        <div className="flex justify-end border-t-2 border-blue-900 py-2 mt-2">
          <div className="flex flex-col items-end space-y-1">
            <div className="text-blue-900 font-bold text-base">
              Total Collection:
              <span className="ml-4 text-black font-semibold">{formatCurrency(totalUsd, "USD")}</span>
              <span className="ml-4 font-semibold text-green-600">{formatCurrency(totalNpr, "NPR")}</span>
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
