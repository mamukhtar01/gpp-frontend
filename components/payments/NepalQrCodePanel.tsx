"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

export default function NepalQRPanel(props: {
  amount: number; // or string
  billNumber: string;
}) {
  const [qr, setQr] = React.useState<string | null>(null);
  const [trace, setTrace] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/nepalqr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pointOfInitialization: 12,
          acquirerId: "00002501",
          merchantId: "2501ELFDRY2",
          merchantName: "Plazma Tech",
          merchantCategoryCode: 4121,
          merchantCountry: "NP",
          merchantCity: "Kathmandu",
          merchantPostalCode: "4600",
          merchantLanguage: "en",
          transactionCurrency: 524,
          transactionAmount: props.amount,
          billNumber: props.billNumber,
          storeLabel: "Store1",
          terminalLabel: "Terminal1",
          purposeOfTransaction: "Bill payment"         
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(json));
      setQr(json.data?.qrString ?? null);
      setTrace(json.data?.validationTraceId ?? null);
    } catch (e: unknown) {
      alert("Failed to generate QR: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 grid  gap-6 max-w-4xl w-full p-6 justify-center items-center border border-gray-300 rounded bg-white">
      <div className="text-lg font-semibold">Nepal QR Code Payment</div>
      <button
        className="px-4 py-2 rounded bg-black text-white"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Nepal QR"}
      </button>
      {qr && (
        <div className="space-y-2 bg-white p-4 rounded flex flex-col items-center">
          <QRCodeSVG value={qr} size={400} />
          <div className="text-xs break-all">validationTraceId: {trace}</div>
          <div className="text-xs break-all">qrString: {qr}</div>
        </div>
      )}
    </div>
  );
}
