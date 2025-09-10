"use client"

import React from "react";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TPaymentRecord } from "@/app/types";

export default function PaymentNotCompleted({ caseDetails }: { caseDetails: TPaymentRecord }) {
  const payment = caseDetails;

  return (
    <div className="flex items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-2xl w-full shadow-lg border border-gray-200 rounded-2xl">
        <CardHeader className="flex flex-col items-center">
          <XCircle className="h-16 w-16 text-yellow-500" />
          <CardTitle className="mt-2 text-2xl font-bold text-center text-yellow-600">
            Payment Not Completed
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1 text-center">
            The payment for this case wasn&#39;t completed. Please review the details
            below and try again or contact support if you think this is an error.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Separator />

          <div className="flex justify-between text-sm">
            <span className="font-medium">Case Number</span>
            <span>{payment.case_id}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="font-medium">Payer</span>
            <span>{payment.payerInfo ?? "-"}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="font-medium">Amount</span>
            <span className="text-red-600">{payment.paidAmount ?? "-"}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="font-medium">Payment Method</span>
            <span>{renderPaymentType(payment.type_of_payment)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="font-medium">Status</span>
            <span>{renderStatus(payment.status)}</span>
          </div>

          <Separator className="my-8 border-dashed border-gray-300 border-b-2" />

          <div className="flex justify-between w-full">
            <Link href={`/`}>
              <Button>Back to Home</Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()} >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderPaymentType(type?: number) {
  switch (type) {
    case 1:
      return "Bank Deposit";
    case 2:
      return "Nepal QR Payment";
    case 3:
      return "Cash Payment";
    case 4:
      return "Card Payment";
    default:
      return "Unknown";
  }
}

function renderStatus(status?: number) {
  if (status == null) return "Unknown";
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Processing";
    case 2:
      return "Completed";
    case 3:
      return "Failed";
    default:
      return `Status ${status}`;
  }
}
