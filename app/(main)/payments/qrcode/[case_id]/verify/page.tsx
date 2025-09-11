import { updatePaymentStatus, verifyPaymentTxn } from "@/app/server_actions";
import { TPaymentRecord, TTxnReportResponseFailure } from "@/app/types";
import client from "@/lib/directus";
import { readItems } from "@directus/sdk";

// app/payment-confirmation/page.tsx (Next.js App Router)

import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { TransactionNotCompleted } from "./failed";



export default async function PaymentConfirmationPage({
  params,
}: {
  params: Promise<{ case_id: string }>;
}) {
  const { case_id } = await params;



  // Fetch payment record by case_id to get validationTraceId
  const response = await client.request<TPaymentRecord[]>(
    readItems("Payments", {
      filter: { case_id: { _eq: case_id } },
    })
  );

  const validationTraceId = response[0].validationTraceId;

  if (!validationTraceId) {
    throw new Error("No validationTraceId found for this payment.");
  }

  // Verify payment status

  const transactionReport = await verifyPaymentTxn({
    validationTraceId
  });

  if ("error" in transactionReport) {
    throw new Error(transactionReport.error);
  }

  console.log("Transaction Report:", transactionReport);
  if (transactionReport.responseCode !== "200") {
    return <TransactionNotCompleted transactionReport={transactionReport as TTxnReportResponseFailure} />
  }

  // Success case

  if (!("responseBody" in transactionReport) || transactionReport.responseBody.length === 0) {
    throw new Error("Failed to verify payment transaction.");
  }

// get transaction body
const txn = transactionReport.responseBody[0];

  // Update payment status in Directus to 'completed' (status = 1)

 if(transactionReport.responseCode === "200" && transactionReport.responseStatus === "SUCCESS"){

  const paymentId = response[0].id;
  const payerInfo = txn.payerName;
  if(!paymentId) throw new Error("No payment ID found for this payment.");

   const result =   await updatePaymentStatus({
    paymentId: paymentId!,
    status: 2,
    payerInfo
   });

   console.log("Payment status updated:", result);

 }



  return (
    <div className="flex items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-2xl w-full shadow-lg border border-gray-200 rounded-2xl">
        <CardHeader className="flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
          <CardTitle className="mt-2 text-2xl font-bold text-center text-green-700">
            Payment Successful
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Transaction completed on {new Date(txn.localTransactionDateTime).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="font-medium">Payer:</span>
            <span>{txn.payerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Mobile:</span>
            <span>{txn.payerMobileNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Merchant:</span>
            <span>{txn.merchantName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Transaction Ref:</span>
            <span>{txn.merchantTxnRef}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Amount:</span>
            <span className="font-semibold text-green-600">${txn.amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Validation ID:</span>
            <span>{txn.validationTraceId}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






