import client from "@/lib/directus";
import { readItems } from "@directus/sdk";

// app/payment-confirmation/page.tsx (Next.js App Router)

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TPaymentRecord } from "@/app/types";
import ReceiptActions from "@/components/custom/receipt-actions";

export default async function PaymentConfirmationPage({
  params,
}: {
  params: { case_id: string };
}) {

  // Extract case_id from params
  const { case_id } = await params;

  // Fetch payment record by case_id to get validationTraceId
  const response = await client.request<TPaymentRecord[]>(
    readItems("Payments", {
      filter: { case_id: { _eq: case_id } },
    })
  );

  if (response.length === 0) {
    throw new Error("No payment record found for this case_id.");
  }

  if (response[0].type_of_payment !== 2) {
    throw new Error("payment failed");
  }

  const payment = response[0];

  return (
    <div className="flex items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-2xl w-full shadow-lg border border-gray-200 rounded-2xl">
        <CardHeader className="flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
          <CardTitle className="mt-2 text-2xl font-bold text-center text-green-700">
            Payment Successful
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Transaction completed on{" "}
            {new Date(payment.date_of_payment).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="font-medium">Payer:</span>
            <span>{payment.payerInfo}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Case Number</span>
            <span>{payment.case_id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Type of Payment</span>
            {payment.type_of_payment === 2 ? (
              <span>Cash Payment</span>
            ) : (
              <span>Unknown</span>
            )}
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Transaction Ref:</span>
            <span>{payment.transaction_id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Amount:</span>
            <span className="font-semibold text-green-600">
              ${payment.paidAmount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Amount is local currency</span>
            <span>{payment.amount_in_local_currency}</span>
          </div>
          {/* Receipt action buttons (client component) */}
          <ReceiptActions
            receipt={{
              payerInfo: payment.payerInfo ?? undefined,
              case_id: payment.case_id ?? undefined,
              transaction_id: payment.transaction_id ?? undefined,
              paidAmount: payment.paidAmount ?? undefined,
              amount_in_local_currency:
                payment.amount_in_local_currency ?? undefined,
              date_of_payment: payment.date_of_payment ?? undefined,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
