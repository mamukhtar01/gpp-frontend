"use client";

import { XCircle } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Image from "next/image";

import { TTxnReportResponseFailure } from "@/app/types";
import { QRCodeSVG } from "qrcode.react";

export function TransactionNotCompleted({
  transactionReport,
  qrCode,
}: {
  transactionReport: TTxnReportResponseFailure;
  qrCode: string | null;
}) {

  console.log("Transaction Not Completed Details:", transactionReport, qrCode);
  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 p-6">
      {/* Payment not Initiated */}
      <CardHeader className="flex flex-col items-center">
        <XCircle className="h-16 w-16 text-yellow-500" />
        <CardTitle className="mt-2 text-2xl font-bold text-yellow-600">
          Payment Not Initiated
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          {transactionReport.responseDescription ??
            "Your transaction could not be completed."}
        </p>
      </CardHeader>
      <CardContent>
        <Separator className="my-3" />
        <p className="text-sm text-gray-500 mt-1">
          Please check payment details and try again.
        </p>
        <Separator className="my-8" />
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full hover:cursor-pointer hover:bg-gray-200"
        >
          Refresh Page
        </Button>

        {qrCode && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className="w-full mt-4 hover:cursor-pointer hover:bg-gray-100"
              >
                View QRCODE TO PAY
              </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-[600px] flex flex-col items-center bg-white">
              <div className="mb-2 font-semibold text-lg text-center text-gray-800">
                Payment QR Code
              </div>
              <div className="mb-2">
              
                <QRCodeSVG value={qrCode} size={300} />
              </div>
              <div className="text-xs text-gray-700 text-center">
                <div>Amount: <strong>{"203" }</strong></div>
                <div>Reference: <strong>{34543543543}</strong></div>
                <div>
                  Description:{" "}
                  <span>
                    {transactionReport.responseDescription || "Payment details"}
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </CardContent>
    </div>
  );
}