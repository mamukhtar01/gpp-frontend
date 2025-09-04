"use client";

import React, { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Separator } from "@radix-ui/react-separator";
import { useCaseContext } from "@/app/payments/nepal-qr/caseContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NepalQRCodePanel({
  params,
}: {
  params: { case_id: string };
}) {
  const { caseData, qrData } = useCaseContext();
  const router = useRouter();

  // if user refreshes or opens page directly and no context exists, go back to search
  useEffect(() => {
    async function fetchData() {
      if (!caseData || !qrData) {
        router.replace("/payments/nepal-qr");
        return;
      }

      // if we have both case and qr data,
      if (!caseData && !qrData) {
        return;
      }

      // save data to db
      await fetch("/api/payments/mimosa", {
        method: "POST",
        body: JSON.stringify({
          case_id: caseData.id,
          amount_in_dollar: caseData.package_price,
          amount_in_local_currency: caseData.package_price,
          type_of_payment: 2,
          date_of_payment: new Date().toISOString(),
          transaction_id: crypto.randomUUID(),
          status: 2,
          validationTraceId: qrData.validationTraceId,
          payerInfo: caseData.main_client,
          qr_timestamp: qrData.timestamp,
          paidAmount: caseData.package_price,
          qr_string: qrData.qrString,
        }),
      });
    }

    fetchData()
      .then(() => {
        // Optionally, you can add any additional logic after the data is fetched
      })
      .catch((error) => {
        console.error("Error in fetchData:", error);
      });
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
    <div className="min-w-4xl items-center flex flex-col self-center">
      <div className="flex flex-row items-center justify-between w-full">
        <Button
          onClick={() => router.back()}
          className="text-sm text-gray-600  hover:cursor-pointer"
          variant="outline"
        >
          Go Back
        </Button>
        <Button
          onClick={() => router.back()}
          className="text-sm text-green-600 hover:cursor-pointer"
          variant="secondary"
        >
          Verify Payment
        </Button>
      </div>

      <Separator className="my-4 border-b border-gray-200" />

      <div className="space-y-3 w-min grid gap-6 max-w-4xl p-6 justify-center items-center border border-gray-300 rounded bg-white">
        <div className="space-y-2  p-4 rounded flex flex-col items-center">
          <QRCodeSVG value={qrValue} size={400} />
          <Separator className="my-6 border-b border-gray-200 " />
          <div className="text-xs break-all">
            Amount To Pay: <span className="font-semibold">{amount}</span>
          </div>
          <div className="text-xs break-all">
            Main Client:{" "}
            <span className="font-semibold">{caseData.main_client}</span>
          </div>
          <div className="text-xs break-all">
            Case Number: <span className="font-semibold">{caseData.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
