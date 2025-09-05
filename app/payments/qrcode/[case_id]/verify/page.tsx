import { verifyPaymentTxn } from "@/app/server_actions";
import { TPaymentRecord, TTxnReportResponseFailure } from "@/app/types";
import client from "@/lib/directus";
import { readItems } from "@directus/sdk";

// app/payment-confirmation/page.tsx (Next.js App Router)

import { CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button";

// const transactionReport = {
//   timestamp: "2025-09-05T18:10:20.488+0000",
//   responseCode: "200",
//   responseStatus: "SUCCESS",
//   responseMessage: null,
//   responseBody: [
//     {
//       sessionSrlNo: "10325",
//       recDate: "2025-09-05",
//       instructionId: "CIPS-94684",
//       issuerNetwork: "NQR",
//       amount: 55,
//       payerName: "Surendra Bahadur Pomo",
//       payerMobileNumber: "+977-9702091333",
//       merchantName: "IOM Teaching",
//       merchantTxnRef: "NEPALPAYQR-532555",
//       terminal: "Terminal1",
//       merchantBillNo: "0",
//       instrument: "CIPS",
//       validationTraceId: "2509050000464129UWL",
//       merchantPan: "0401OQKDIW5",
//       storeLabel: "Store1",
//       localTransactionDateTime: "2025-09-05T06:46:09.486+0000",
//     },
//   ],
// }

export default async function PaymentConfirmationPage({
  params,
}: {
  params: { case_id: string };
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
    return <TransactionFailed transactionReport={transactionReport as TTxnReportResponseFailure} />
  }

  // Success case

  if (!("responseBody" in transactionReport) || transactionReport.responseBody.length === 0) {
    throw new Error("Failed to verify payment transaction.");
  }


  const txn = transactionReport.responseBody[0]

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






function TransactionFailed({ transactionReport }: { transactionReport: TTxnReportResponseFailure }) {
  return (
     <div className="flex flex-col items-center justify-center bg-gray-50 p-6">
            {/* ❌ FAILURE CASE */}
            <CardHeader className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-red-900" />
              <CardTitle className="mt-2 text-2xl font-bold text-red-900">
                Payment Failed
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {transactionReport.responseDescription ??
                  "Your transaction could not be completed."}
              </p>
            </CardHeader>
            <CardContent>
              <Separator className="my-3" />
              <Button variant="secondary" className="w-full hover:cursor-pointer"  >
                Try Again
              </Button>
            </CardContent>
          </div>
  )
}