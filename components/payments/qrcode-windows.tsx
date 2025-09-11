"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

type Props = {
  qrValue: string;
  amount?: number | string;
  payerInfo?: string | null;
  caseId?: string | null;
};

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function QRCodeWindows({ qrValue, amount, payerInfo, caseId }: Props) {
  const qrRef = useRef<HTMLDivElement | null>(null);

  const openWindows = () => {
    try {
      const svgHtml = qrRef.current?.innerHTML ?? "";

      const qrWindow = window.open("", "_blank", "width=420,height=640");
      if (qrWindow) {
        const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>QR Code</title>
          <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"> 
          <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0;padding:20px;font-family:Inter,system-ui,Arial;background:#fff}
          .wrap{display:flex;flex-direction:column;align-items:center}
          svg{max-width:100%;height:auto}
          button{margin-top:16px;padding:8px 12px;border-radius:6px;border:1px solid #ccc;background:#f7f7f7;cursor:pointer}
          </style></head><body><div class=\"wrap\">${svgHtml}
          <button onclick=\"window.print()\">Print / Open Print Dialog</button>
          </div></body></html>`;
        qrWindow.document.open();
        qrWindow.document.write(html);
        qrWindow.document.close();
      } else {
        alert("Unable to open QR window. Please allow popups.");
      }

      const dataWindow = window.open("", "_blank", "width=600,height=480");
      if (dataWindow) {
        const safePayer = escapeHtml(payerInfo ?? "");
        const safeCase = escapeHtml(caseId ?? "");
        const safeQr = escapeHtml(qrValue ?? "");
        const safeAmount = escapeHtml(String(amount ?? ""));

        const clipboardText = `Amount: ${String(amount ?? "")}\nPayer: ${payerInfo ?? ""}\nCase ID: ${caseId ?? ""}\nQR: ${qrValue}`;

        const dataHtml = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Payment Data</title>
          <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"> 
          <style>body{font-family:Inter,system-ui,Arial;padding:20px;background:#fff;color:#111}
          pre{white-space:pre-wrap;word-break:break-word;background:#fff;border:1px solid #eee;padding:12px;border-radius:6px}
          .btn{margin-top:12px;padding:8px 12px;border-radius:6px;border:1px solid #ccc;background:#f7f7f7;cursor:pointer;margin-right:8px}
          </style></head><body>
          <h2>Payment Details</h2>
          <pre>Amount: ${safeAmount}\nPayer: ${safePayer}\nCase ID: ${safeCase}\nQR: ${safeQr}</pre>
          <div>
            <button class=\"btn\" onclick=\"(async function(){try{await navigator.clipboard.writeText(${JSON.stringify(
          clipboardText
        )});alert('Copied to clipboard')}catch(e){alert('Copy failed')}})()\">Copy to clipboard</button>
            <button class=\"btn\" onclick=\"window.print()\">Print QR Code</button>
          </div>
          </body></html>`;

        dataWindow.document.open();
        dataWindow.document.write(dataHtml);
        dataWindow.document.close();
      } else {
        alert("Unable to open data window. Please allow popups.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to open windows");
    }
  };

  return (
    <div>
      {/* hidden QR renderer to grab an SVG string */}
      <div style={{ position: "absolute", left: -9999, top: -9999 }} aria-hidden ref={qrRef}>
        <QRCodeSVG value={qrValue} size={600} />
      </div>
      <Button onClick={openWindows} variant="outline" className="mt-4 text-sm">
        Open QR Code
      </Button>
    </div>
  );
}
