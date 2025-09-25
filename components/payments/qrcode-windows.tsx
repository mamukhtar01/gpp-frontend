"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";

type Props = {
  qrValue: string;
  amount?: number | string;
  payerInfo?: string | null;
  caseId?: string | null;
};


export default function QRCodeWindows({ qrValue, amount, payerInfo, caseId }: Props) {
  const sendViaWhatsApp = async () => {
    try {
      // Render QR code to canvas
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, qrValue, { width: 300 });
      // Get PNG data URL
      const dataUrl = canvas.toDataURL("image/png");
      // Convert dataURL to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "qrcode.png", { type: "image/png" });

      // Compose message
      const text = `Payment Details:\nAmount: ${amount ?? ""}\nPayer: ${payerInfo ?? ""}\nCase ID: ${caseId ?? ""}`;

      // Use Web Share API if available and supports files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          text,
          title: "QR Code Payment",
        });
      } else {
        alert("Native sharing with image is not supported on this device/browser. Please use a mobile browser or copy the image manually.");
      }
    } catch (err) {
      alert("Failed to share QR via WhatsApp");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Button onClick={sendViaWhatsApp} variant="link" className="mt-2 text-xs hover:cursor-pointer text-green-600">
        Send via WhatsApp or Email
      </Button>
    </div>
  );
}
