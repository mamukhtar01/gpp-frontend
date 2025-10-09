import client from "@/lib/directus";
import { readItems } from "@directus/sdk";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReceiptActions from "@/components/custom/receipt-actions";
import PaymentNotCompleted from "@/components/custom/payment-not-completed";
import { TPaymentType } from "@/app/types";
import { formatCurrency } from "@/lib/fee-utils";

export default async function PaymentConfirmationPage({
  params,
}: {
  params: Promise<{ case_number: string }>;
}) {
  // Extract case_number from params
  const { case_number } = await params;

  // Fetch payment record by case_number to get validationTraceId
  const response = await client.request(
    readItems("Payments", {
      filter: {
        case_number: { _eq: case_number },
        type_of_payment: { _eq: TPaymentType.Cash }, // Ensure it's a cash payment
      },
      fields: ["*"],
    })
  );

  if (!response || response.length === 0) {
    throw new Error("No payment record found for this case_number.");
  }

  if (response[0].status !== 2) {
    // if status !== 2, payment is failed. render payment failed component
    return <PaymentNotCompleted caseDetails={response[0]} />;
  }

  const payment = response[0];

  return (
    <div className="flex min-h-screen items-center justify-center  py-4 px-4">
      <Card className="w-full max-w-4xl shadow-2xl border-0 rounded-3xl bg-white/95 px-12 py-4">
        <CardHeader className="flex flex-col items-center gap-3 pb-0">
          <CheckCircle2 className="h-16 w-16 text-green-600 drop-shadow-xl mb-2" />
          <CardTitle className="mt-2 text-3xl font-extrabold text-center text-green-700 tracking-tight">
            Payment Successful!
          </CardTitle>
          <p className="text-base text-gray-700 mt-1 font-medium">
           
            <span className="text-green-900 font-semibold">
              Payment transaction has been recorded.
            </span>
          </p>
          <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-2 mt-4">
            <span className="text-sm text-green-800">
              Transaction Date: <b>{new Date(payment.date_of_payment).toLocaleString()}</b>
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-10 pt-8">
          <Separator className="border-dashed border-green-300" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-5">
              <Detail label="Clients" value={<ReadingText>{payment.payerInfo}</ReadingText>} />
              <Detail label="Case Number" value={<ReadingText>{payment.case_number}</ReadingText>} />
              <Detail label="Payment Type" value={<PaymentType type_of_payment={payment.type_of_payment} />} />
            </div>
            <div className="space-y-5">
              <Detail label="Transaction Ref" value={<ReadingText>{payment.transaction_id}</ReadingText>} />
              <Detail label="Amount (local)" value={<span className="font-bold text-green-700">{formatCurrency(payment.paidAmount || 0, "NPR")}</span>} />
              <Detail label="Amount (USD)" value={<ReadingText>{formatCurrency(payment.amount_in_dollar || 0, "USD")}</ReadingText>} />
            </div>
          </div>
          <Separator className="my-10 border-dashed border-green-200 border-b-2" />
          <div className="flex flex-col items-center gap-3">
            <ReceiptActions
              receipt={{
                payerInfo: payment.payerInfo ?? undefined,
                case_number: payment.case_number ?? undefined,
                transaction_id: payment.transaction_id ?? undefined,
                paidAmount: payment.paidAmount ?? undefined,
                amount_in_local_currency:
                  payment.amount_in_local_currency ?? undefined,
                date_of_payment: payment.date_of_payment,
              }}
            />
            <span className="text-xs text-gray-400 mt-2">
              Share or print receipt to the client for their records.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Detail component for row layout
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex   w-full  ">
      <span className="font-semibold text-gray-600  pr-6">{label}:</span>
      <span className="text-gray-900  text-left pl-6">{value}</span>
    </div>
  );
}

// ReadingText for visually distinctive, readable info
function ReadingText({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-lg font-medium text-blue-800 tracking-wide break-words">
      {children}
    </span>
  );
}

function PaymentType({ type_of_payment }: { type_of_payment: number }) {
  switch (type_of_payment) {
    case 1:
      return <span>Bank Deposit</span>;
    case 2:
      return <span>Nepal QR Payment</span>;
    case 3:
      return <span>Cash Payment</span>;
    case 4:
      return <span>Card Payment</span>;
    default:
      return <span>Unknown</span>;
  }
}