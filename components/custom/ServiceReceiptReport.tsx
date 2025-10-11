"use client";
import Image from "next/image";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

// Import html2canvas-pro only in the handler (dynamic import for SSR)
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

  // Print handler: print only the receipt, preserving current styles/layout
  const handlePrint = () => {
    if (!receiptRef.current) return;
    const headHtml = Array.from(
      document.querySelectorAll(
        'head style,head link[rel="stylesheet"],head meta,head title'
      )
    )
      .map((el) => el.outerHTML)
      .join("\n");
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
                .receipt-root {
                  box-shadow: none !important;
                  border: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  max-width: 100% !important;
                  width: 100% !important;
                }
                .print\\:hidden {
                  display: none !important;
                }
                table, th, td {
                  border: 1px solid #333 !important;
                  page-break-inside: avoid !important;
                }
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

  // Share as PDF using html2canvas-pro and jsPDF
  const handleSharePdf = async () => {
    if (!receiptRef.current) return;

    const html2canvasPro = (await import("html2canvas-pro")).default;

    const canvas = await html2canvasPro(receiptRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    // Use standard A4 page size
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Fit image to page with margin
    const margin = 20;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
    } else {
      // Multi-page (split image vertically)
      // We'll draw visible segments per page until done
      let remainingHeight = imgHeight;
      let position = 0;
      const pageDrawHeight = pageHeight - margin * 2;
      while (remainingHeight > 0) {
        pdf.addImage(
          imgData,
          "JPEG",
          margin,
          margin,
          imgWidth,
          pageDrawHeight,
          undefined,
          "FAST",
          position / imgHeight
        );
        remainingHeight -= pageDrawHeight;
        position += pageDrawHeight;
        if (remainingHeight > 0) pdf.addPage();
      }
    }

    const pdfBlob = pdf.output("blob");
    const file = new File([pdfBlob], "ServiceReceipt.pdf", {
      type: "application/pdf",
    });

    // Try to share with navigator.share (mobile only)
    if (
      typeof navigator !== "undefined" &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: "Service Receipt",
        text: "Please find attached your service receipt.",
      });
    } else {
      // Fallback: download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ServiceReceipt.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="receipt-root max-w-5xl w-full mx-auto bg-white border border-gray-300 px-8 py-8 text-black font-serif print:px-0 print:py-0 shadow-md">
      <div ref={receiptRef}>
        {/* Header */}
        <div className="flex flex-col items-center mb-2">
          <Image
            src="/logo-blue.png"
            alt="IOM Logo"
            width={264}
            height={264}
            priority
            style={{ width: "300px", height: "150px", objectFit: "contain" }}
          />
          <div className="font-bold text-lg text-center leading-tight">
            IOM Migration Health Assessment Center
          </div>
          <div className="text-center text-sm">
            768/44, Thirbam Sadak, Baluwatar-4 <br />
            +977 1 5970001
          </div>
        </div>
        <div className="flex justify-between items-center mt-1 mb-2">
          <div className="text-sm font-semibold">
            Bill #: <span className="font-normal">{billNumber}</span>
          </div>
          <div className="text-sm font-semibold">
            Date: <span className="font-normal">{date}</span>
          </div>
        </div>
        {/* Title */}
        <div className="text-center font-bold text-base mb-2 mt-2 underline">
          Service Receipt
        </div>
        {/* Info */}
        <div className="grid grid-cols-2 gap-x-8 mb-2">
          <div className="space-y-1">
            <div className="flex text-sm">
              <span className="font-semibold w-24">Case #:</span>
              <span className="font-normal break-words">{caseNumber}</span>
            </div>
            <div className="flex text-sm">
              <span className="font-semibold w-24">PAs Name:</span>
              <span className="font-normal break-words">{paName}</span>
            </div>
            <div className="flex text-sm">
              <span className="font-semibold w-24">Address:</span>
              <span className="font-normal break-words">{address}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex text-sm">
              <span className="font-semibold w-14">Size:</span>
              <span className="font-normal break-words">{size}</span>
            </div>
          </div>
        </div>
        {/* Services Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mb-1 text-sm">
            <thead>
              <tr className="border-t border-b border-gray-800">
                <th className="border px-2 py-1 font-semibold text-left bg-gray-100 w-1/2 min-w-[100px]">
                  Service Name
                </th>
                <th className="border px-2 py-1 font-semibold text-center bg-gray-100 w-1/6 min-w-[60px]">
                  Unit
                </th>
                <th className="border px-2 py-1 font-semibold text-center bg-gray-100 w-1/6 min-w-[80px]">
                  Unit Price
                </th>
                <th className="border px-2 py-1 font-semibold text-center bg-gray-100 w-1/6 min-w-[80px]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 align-top w-1/2 break-words">
                    {s.name}
                  </td>
                  <td className="border px-2 py-1 text-center w-1/6 break-words">
                    {s.unit.toFixed(2)}
                  </td>
                  <td className="border px-2 py-1 text-center w-1/6 break-words">
                    ${s.unitPrice.toFixed(2)}
                  </td>
                  <td className="border px-2 py-1 text-center w-1/6 break-words">
                    ${s.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Amounts */}
        <div className="w-full flex flex-col items-end text-sm mb-4">
          <div className="flex w-full max-w-xs justify-between">
            <span>Total Amount:</span>
            <span className="font-semibold">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between">
            <span>Total Amount in NPR:</span>
            <span>{totalAmountNPR.toFixed(2)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between">
            <span>Total Cash Received NPR:</span>
            <span>{totalCashReceivedNPR.toFixed(2)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between">
            <span>Net Cash Return NPR:</span>
            <span>{netCashReturnNPR.toFixed(2)}</span>
          </div>
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center mt-8 mb-2">
          <div className="flex flex-col items-center">
            <div className="w-40 border-t border-black mb-1"></div>
            <div className="text-sm font-semibold break-words">
              {cashierName}
            </div>
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
            className="text-blue-700 underline break-all"
            rel="noopener noreferrer"
          >
            https://www.emedical.immi.gov.au/eMedUI/eMedicalClient
          </a>
          <br />
          to track the status of your medical examination.
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-6 mt-8 print:hidden">
        <Button variant="default" size="lg" onClick={handleSharePdf}>
          Share / Download PDF
        </Button>
        <Button variant="outline" size="lg" onClick={handlePrint}>
          Print
        </Button>
      </div>
    </div>
  );
};
