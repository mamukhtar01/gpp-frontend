import { getPaymentByCaseIdAction, updatePaymentStatus, verifyPaymentTxn } from "@/app/server_actions";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TransactionNotCompleted } from "./failed";
import { TPaymentType, TTxnReportResponseFailure } from "@/app/types";

// Label/Value pair component
function LabelValue({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-[280px] gap-0.5">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-lg text-gray-900 font-semibold">{value}</span>
    </div>
  );
}

export interface PageProps {
  params: Promise<{ case_number: string }>;
  searchParams: Promise<{ paymentId: string }>;
}

export default async function PaymentConfirmationPage({
  params,
  searchParams,
}: PageProps) {
  const { case_number } = await params;
  const { paymentId } = await searchParams;
  if (!case_number || case_number.trim() === "" || !paymentId || paymentId.trim() === "") {
    return (
      <div className="max-w-4xl flex flex-col items-center">
        <h2 className="text-sm text-red-600">
          Invalid case number or payment ID.
        </h2>
      </div>
    );
  }

  // Fetch payment record by case_number to get validationTraceId
 // Fetch Payment Data
  const payment = await getPaymentByCaseIdAction({
    paymentId: paymentId,
    caseNo: case_number,
    paymentType: TPaymentType.QR,
  });

  if (!payment?.validationTraceId)
    throw new Error("No validationTraceId found for this payment.");

  // Verify payment status
  const transactionReport = await verifyPaymentTxn({
    validationTraceId: payment.validationTraceId,
  });

  if ("error" in transactionReport) throw new Error(transactionReport.error);

  if (transactionReport.responseCode !== "200") {
    return (
      <TransactionNotCompleted
        qrCode={payment.qr_string}
        transactionReport={transactionReport as TTxnReportResponseFailure}
      />
    );
  }

  if (
    !("responseBody" in transactionReport) ||
    transactionReport.responseBody.length === 0
  ) {
    throw new Error("Failed to verify payment transaction.");
  }

  const txn = transactionReport.responseBody[0];

  // Update payment status in Directus to 'completed' (status = 2)
  if (transactionReport.responseStatus === "SUCCESS" && payment.status !== 2) {
    const result = await updatePaymentStatus({
      paymentId: payment.id!,
      status: 2,
      payerInfo: txn.payerName,
    });
    if (!result) throw new Error("Failed to update payment status.");
  }

  // SELECTED FIELDS for clean display
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-16 py-20">
      <Card className="max-w-5xl w-full shadow-2xl border border-gray-100 rounded-3xl bg-white">
        <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-6">
          <CheckCircle2 className="h-18 w-18 text-green-600 mb-2" />
          <CardTitle className="text-2xl font-extrabold text-center text-green-700">
            Payment Successful
          </CardTitle>
          <p className="text-lg text-gray-500 mt-2">
            Transaction completed on{" "}
            <span className="font-semibold text-gray-700">
              {new Date(txn.localTransactionDateTime).toLocaleString()}
            </span>
          </p>
        </CardHeader>
        <Separator className="my-6" />
        <CardContent className="space-y-8 px-16 pb-14">
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <LabelValue label="Payer Name" value={txn.payerName} />
            <LabelValue label="Mobile Number" value={txn.payerMobileNumber} />
            <LabelValue label="Merchant" value={txn.merchantName} />
            <LabelValue label="Store" value={txn.storeLabel} />
            <LabelValue label="Terminal" value={txn.terminal} />
            <LabelValue
              label="Amount (USD)"
              value={
                <span className="font-bold text-green-600 text-2xl">
                  ${payment.amount_in_dollar}
                </span>
              }
            />
            <LabelValue
              label="Amount (Local)"
              value={
                <span className="font-bold text-green-600 text-2xl">
                  {payment.amount_in_local_currency}
                </span>
              }
            />
            <LabelValue
              label="Payment Type"
              value={
                payment.type_of_payment === 2 ? "Cash" : payment.type_of_payment
              }
            />
            <LabelValue label="Service Type" value={payment.service_type} />
            <LabelValue
              label="Reference ID"
              value={payment.validationTraceId}
            />
            <LabelValue label="Transaction ID" value={payment.transaction_id} />
            <LabelValue label="Merchant Txn Ref" value={txn.merchantTxnRef} />
            <LabelValue label="Case Number" value={payment.case_number} />
            <LabelValue
              label="Date of Payment"
              value={new Date(payment.date_of_payment).toLocaleString()}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
