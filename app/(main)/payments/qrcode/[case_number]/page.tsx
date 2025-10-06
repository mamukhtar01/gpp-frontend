import { QRCodeSVG } from "qrcode.react";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { getPaymentByCaseIdAction } from "@/app/server_actions";
import GoBackBtn from "@/components/custom/gobackbtn";
import Link from "next/link";
import QRCodeWindows from "@/components/payments/qrcode-windows";
import { TPaymentType } from "@/app/types";

export default async function VerifyPaymentPageByCaseNumber({
  params,
}: {
  params: { case_number: string };
}) {
  const { case_number } = await params;

  // Fetch Payment Data
  const paymentRecord = await getPaymentByCaseIdAction(
    case_number,
    TPaymentType.QR
  );

  if (!paymentRecord || !paymentRecord.qr_string) {
    return (
      <div className="max-w-4xl flex flex-col items-center">
        <h2 className="text-sm text-red-600">
          Payment information is not available.
        </h2>
      </div>
    );
  }

  const clientsInfo = paymentRecord.clients ?? [];
  const amount = Number(paymentRecord.amount_in_local_currency) || 0;
  const qrValue = paymentRecord.qr_string;

  return (
    <div className="max-w-4xl w-full flex flex-col items-center">
      <div className="flex flex-row items-center justify-between w-full">
        <GoBackBtn />
        <Link href={`/payments/qrcode/${case_number}/verify`}>
          <Button
            className="text-sm text-green-600 hover:cursor-pointer"
            variant="secondary"
          >
            Verify Payment
          </Button>
        </Link>
      </div>

      <Separator className="my-4 border-b border-gray-200" />

      <div className="space-y-3 w-full p-6 border border-gray-300 rounded bg-white">
        <div className="space-y-2 p-4 rounded flex flex-col items-center">
          <QRCodeSVG value={qrValue} size={300} />

          <div className="mt-4 self-end">
            <QRCodeWindows
              qrValue={qrValue}
              amount={amount}
              payerInfo={paymentRecord.payerInfo}
              caseId={paymentRecord.case_number}
            />
          </div>

          <Separator className="my-8 border-b h-0.5 border-gray-200 w-full" />
          <div className="w-full max-w-md">
            <div className="text-md">
              Total Amount to Pay (NPR):{" "}
              <span className="font-semibold">{amount.toFixed(2)}</span>
            </div>
            <div className="text-md">
              Case Number:{" "}
              <span className="font-semibold">{paymentRecord.case_number}</span>
            </div>

            {/* Clients Table */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Clients</h3>
              <div className="w-full overflow-x-auto">
                {clientsInfo.length > 0 ? (
                  <table className="w-full text-sm border">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left">#</th>
                        <th className="px-2 py-1 text-left">Name</th>
                        <th className="px-2 py-1 text-left">Age</th>
                        <th className="px-2 py-1 text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientsInfo.map((client, index) => (
                        <tr key={client.id} className="odd:bg-gray-50">
                          <td className="px-2 py-1">{index + 1}</td>
                          <td className="px-2 py-1">{client.name}</td>
                          <td className="px-2 py-1">{client.age}</td>
                          <td className="px-2 py-1">${client.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-xs text-gray-500">No clients found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
