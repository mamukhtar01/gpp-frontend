import client from "@/lib/directus";
import { readItems } from "@directus/sdk";

// app/payment-confirmation/page.tsx (Next.js App Router)

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReceiptActions from "@/components/custom/receipt-actions";
import PaymentNotCompleted from "@/components/custom/payment-not-completed";
import { TPaymentType } from "@/app/types";

export default async function PaymentConfirmationPage({
  params,
}: {
  params: Promise<{ case_number: string }>;
}) {

  // Extract case_number from params
  const { case_number } = await params;

 

  // Fetch payment record by case_number to get validationTraceId
 const response = await client.request(
  readItems('Payments', {
    filter: {
      case_number: { _eq: case_number },
      type_of_payment: { _eq: TPaymentType.Cash  } // Ensure it's a cash payment
    },
    fields: ['*']
  })
);

  console.log(response);

  if (!response || response.length === 0) {
    throw new Error("No payment record found for this case_number.");
  }

  if (response[0].status !== 2) {
    // if status !== 2, payment is failed. render payment failed component
  return <PaymentNotCompleted caseDetails={response[0]} />;
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
            <span>{payment.case_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Type of Payment</span>
          <PaymentType type_of_payment={payment.type_of_payment} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Transaction Ref:</span>
            <span>{payment.transaction_id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Amount:</span>
            <span className="font-semibold text-green-600">
              {payment.paidAmount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Amount (USD)</span>
            <span>${payment.amount_in_dollar}</span>
          </div>
          {/* Receipt action buttons (client component) */}
          <Separator className="my-8 border-dashed border-gray-300 border-b-2" />
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
        </CardContent>
      </Card>
    </div>
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