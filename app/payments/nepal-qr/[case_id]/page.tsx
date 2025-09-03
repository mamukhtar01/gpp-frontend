"use client";

import React, { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Separator } from "@radix-ui/react-separator";
import { useCaseContext } from "@/app/payments/nepal-qr/caseContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NepalQRCodePanel({ params }: { params: { case_id: string } }) {
  const { caseData, qrData } = useCaseContext();
  const router = useRouter();

  // if user refreshes or opens page directly and no context exists, go back to search
  useEffect(() => {
    if (!caseData || !qrData) {
      router.replace("/payments/nepal-qr");
    }
  }, [caseData, qrData, router]);

  if (!qrData || !caseData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>Loading...</div>
      </div>
    );
  }

  const amount = Number(caseData.package_price ?? 0);
  const qrValue = qrData.qrString;

  return (
    <div className="flex flex-col p-6 w-screen justify-center items-center">
      <Button
        onClick={() => router.back()}
        className="text-sm text-gray-600 self-start hover:cursor-pointer"
        variant="outline"
      >
        Go Back
      </Button>

      <div className="space-y-3 w-min grid gap-6 max-w-4xl p-6 justify-center items-center border border-gray-300 rounded bg-white">
        <div className="space-y-2 bg-white p-4 rounded flex flex-col items-center">
          <QRCodeSVG value={qrValue} size={400} />
          <Separator className="my-6 border-b border-gray-200 " />
          <div className="text-xs break-all">
            Amount To Pay: <span className="font-semibold">{amount}</span>
          </div>
          <div className="text-xs break-all">
            Main Client: <span className="font-semibold">{caseData.main_client}</span>
          </div>
          <div className="text-xs break-all">
            Case Number: <span className="font-semibold">{caseData.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
