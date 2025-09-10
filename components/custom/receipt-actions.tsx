"use client";
import React from "react";
import { Button } from "@/components/ui/button";

type ReceiptShape = {
  payerInfo?: string;
  case_id?: string;
  transaction_id?: string;
  paidAmount?: number | string;
  amount_in_local_currency?: number | string;
  date_of_payment?: string;
};

export default function ReceiptActions({
  receipt,
}: {
  receipt: ReceiptShape;
}) {
  const handleGoBack = () => {
    window.history.back();
  };

  const handlePrint = () => {
    // open a printable window with a minimal receipt layout
    const w = window.open("", "_blank");
    if (!w) {
      // fallback to printing current page
      window.print();
      return;
    }

  // use the app's public IOM logo (ensure iom-logo.svg exists in /public)
  const logo = `${window.location.origin}/iom-logo.svg`;

  const date = receipt.date_of_payment
      ? new Date(receipt.date_of_payment).toLocaleString()
      : "";

    const html = `
      <html>
        <head>
          <title>Receipt - ${receipt.case_id ?? ""}</title>
          <meta charset="utf-8" />
          <style>
            body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial; padding:24px; color:#111; background:#fff}
            .receipt{max-width:720px;margin:0 auto}
            .header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
            .logo{height:50px;max-width:240px;object-fit:contain;display:block}
            .title{font-size:20px;margin:0}
            .meta{font-size:12px;color:#374151;margin-top:4px}
            .section{background:#fff;padding:12px;border-radius:8px;border:1px solid #e6e9ee;margin-bottom:12px}
            .row{display:flex;justify-content:space-between;margin:10px 0;font-size:14px}
            .label{color:#6b7280}
            .amount{font-weight:700;color:#059669}
            .sep{height:1px;background:#e6e6e6;margin:14px 0}
            .footer{font-size:12px;color:#6b7280;margin-top:18px;text-align:center}
            @media print{body{padding:8px}}
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <img src="${logo}" class="logo" alt="IOM logo" />
              <div style="flex:1">
                <h1 class="title">Payment Receipt</h1>
                <div class="meta">Case: ${receipt.case_id ?? ""} &nbsp; • &nbsp; Transaction: ${receipt.transaction_id ?? ""}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:14px">${date}</div>
              </div>
            </div>

            <div class="section">
              <div class="row"><div class="label">Payer</div><div>${receipt.payerInfo ?? ""}</div></div>
              <div class="row"><div class="label">Amount</div><div class="amount">$${receipt.paidAmount ?? ""}</div></div>
              <div class="row"><div class="label">Amount (local)</div><div>${receipt.amount_in_local_currency ?? ""}</div></div>
              <div class="sep"></div>
              <div class="row"><div class="label">Payment Type</div><div>Cash</div></div>
            </div>

            <div class="footer">This is a system generated receipt. Please keep for your records.</div>
          </div>
        </body>
      </html>
    `;

    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    // don't automatically close: some browsers block closing if not user-initiated
  };

  return (
    <div className="flex gap-3 justify-between mt-4 ">
      <Button variant="outline" onClick={handleGoBack} size="sm">
        Go back
      </Button>
      <Button onClick={handlePrint} size="sm" variant={"outline"}>
        Print receipt
      </Button>
    </div>
  );
}
