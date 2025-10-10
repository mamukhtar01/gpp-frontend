"use client";
import Image from "next/image";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

type Service = {
  name: string;
  unit: number;
  unitPrice: number;
  amount: number;
};

type ServiceReceiptProps = {
  billNumber: string;
  date: string;
  caseNumber: string;
  size: number | string;
  paName: string;
  address: string;
  services: Service[];
  totalAmount: number;
  totalAmountNPR: number;
  totalCashReceivedNPR: number;
  netCashReturnNPR: number;
  cashierName: string;
  exchangeRate: number;
};

export const ServiceReceiptReport: React.FC<ServiceReceiptProps> = ({
  billNumber,
  date,
  caseNumber,
  size,
  paName,
  address,
  services,
  totalAmount,
  totalAmountNPR,
  totalCashReceivedNPR,
  netCashReturnNPR,
  cashierName,
  exchangeRate,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Prepare share text
  const shareText = `
IOM Migration Health Assessment Center
Service Receipt

Bill #: ${billNumber}
Date: ${date}

Case #: ${caseNumber}
PA's Name: ${paName}
Address: ${address}
Size: ${size}

Services:
${services.map(s => `- ${s.name} | Unit: ${s.unit} | Unit Price: $${s.unitPrice} | Amount: $${s.amount}`).join('\n')}

Total Amount: $${totalAmount}
Total Amount in NPR: ${totalAmountNPR}
Total Cash Received NPR: ${totalCashReceivedNPR}
Net Cash Return NPR: ${netCashReturnNPR}

Cashier: ${cashierName}
Exchange Rate: ${exchangeRate}

Track status: https://www.emedical.immi.gov.au/eMedUI/eMedicalClient
  `.trim();

  // Share handlers
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Service Receipt",
        text: shareText,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      });
    } else {
      // Fallback: open WhatsApp
      const waLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waLink, "_blank");
    }
  };

  // Print handler: print only the receipt, preserving current styles/layout
  const handlePrint = () => {
    if (!receiptRef.current) return;

    // Clone all <style> and <link rel=stylesheet> from the document head
    const headHtml = Array.from(document.querySelectorAll('head style,head link[rel="stylesheet"],head meta,head title'))
      .map((el) => el.outerHTML)
      .join('\n');

    // Get the receipt HTML
    const printContents = receiptRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            ${headHtml}
            <style>
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div id="print-root">
              ${printContents}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto bg-white border border-gray-300 px-8 py-8 text-black font-serif print:px-0 print:py-0 shadow-md">
      <div ref={receiptRef}>
        {/* Header */}
        <div className="flex flex-col items-center mb-2">
          <Image src="/logo-blue.png" alt="IOM Logo" width={264} height={264} />
          <div className="font-bold text-lg text-center leading-tight">IOM Migration Health Assessment Center</div>
          <div className="text-center text-sm">
            768/44, Thirbam Sadak, Baluwatar-4 <br />
            +977 1 5970001
          </div>
        </div>
        <div className="flex justify-between items-center mt-1 mb-2">
          <div className="text-sm font-semibold">Bill #: <span className="font-normal">{billNumber}</span></div>
          <div className="text-sm font-semibold">Date: <span className="font-normal">{date}</span></div>
        </div>
        {/* Title */}
        <div className="text-center font-bold text-base mb-2 mt-2 underline">Service Receipt</div>
        {/* Info */}
        <div className="grid grid-cols-2 gap-x-8 mb-2">
          <div className="space-y-1">
            <div className="flex text-sm">
              <span className="font-semibold w-24">Case #:</span>
              <span className="font-normal">{caseNumber}</span>
            </div>
            <div className="flex text-sm">
              <span className="font-semibold w-24">PAs Name:</span>
              <span className="font-normal">{paName}</span>
            </div>
            <div className="flex text-sm">
              <span className="font-semibold w-24">Address:</span>
              <span className="font-normal">{address}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex text-sm">
              <span className="font-semibold w-14">Size:</span>
              <span className="font-normal">{size}</span>
            </div>
          </div>
        </div>
        {/* Services Table */}
        <table className="w-full border-collapse mb-1 text-sm">
          <thead>
            <tr className="border-t border-b border-gray-800">
              <th className="border px-2 py-1 font-semibold text-left bg-gray-100 w-1/2">Service Name</th>
              <th className="border px-2 py-1 font-semibold text-center bg-gray-100 w-1/6">Unit</th>
              <th className="border px-2 py-1 font-semibold text-center bg-gray-100 w-1/6">Unit Price</th>
              <th className="border px-2 py-1 font-semibold text-center bg-gray-100 w-1/6">Amount</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1 align-top w-1/2 break-words">{s.name}</td>
                <td className="border px-2 py-1 text-center w-1/6">{s.unit.toFixed(2)}</td>
                <td className="border px-2 py-1 text-center w-1/6">${s.unitPrice.toFixed(2)}</td>
                <td className="border px-2 py-1 text-center w-1/6">${s.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Amounts */}
        <div className="w-full flex flex-col items-end text-sm mb-4">
          <div className="flex w-[330px] justify-between">
            <span>Total Amount:</span>
            <span className="font-semibold">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex w-[330px] justify-between">
            <span>Total Amount in NPR:</span>
            <span>{totalAmountNPR.toFixed(2)}</span>
          </div>
          <div className="flex w-[330px] justify-between">
            <span>Total Cash Received NPR:</span>
            <span>{totalCashReceivedNPR.toFixed(2)}</span>
          </div>
          <div className="flex w-[330px] justify-between">
            <span>Net Cash Return NPR:</span>
            <span>{netCashReturnNPR.toFixed(2)}</span>
          </div>
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center mt-8 mb-2">
          <div className="flex flex-col items-center">
            <div className="w-40 border-t border-black mb-1"></div>
            <div className="text-sm font-semibold">{cashierName}</div>
            <div className="text-xs font-normal">Cashier Name</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-40 border-t border-black mb-1"></div>
            <div className="text-xs font-normal">Signature</div>
          </div>
        </div>
        <div className="text-xs mb-2 mt-2">
          <span className="font-semibold">*Exchange Rate - </span>
          {exchangeRate}
        </div>
        <div className="text-xs mt-2">
          <span className="font-semibold">Please visit: </span>
          <a
            href="https://www.emedical.immi.gov.au/eMedUI/eMedicalClient"
            target="_blank"
            className="text-blue-700 underline"
            rel="noopener noreferrer"
          >
            https://www.emedical.immi.gov.au/eMedUI/eMedicalClient
          </a>
          <br />
          to track the status of your medical examination.
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-center gap-6 mt-8 print:hidden">
        <Button
          variant="default"
          size="lg"
          onClick={handleShare}
        >
          Share
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrint}
        >
          Print
        </Button>
      </div>
    </div>
  );
};