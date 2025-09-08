
import { QRCodeSVG } from "qrcode.react";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { getPaymentByCaseIdAction } from "@/app/server_actions";
import GoBackBtn from "@/components/custom/gobackbtn";
import Link from 'next/link';



export default async function NepalQRCodePanel({
  params,
}: {
  params: { case_id: string };
}) {

  const { case_id } = await params;

  // Fetch Payment Data

 const paymentRecord = await getPaymentByCaseIdAction(case_id);


  
if (!paymentRecord || !paymentRecord.qr_string) {
    return (
      <div className="min-w-4xl items-center flex flex-col self-center">
        <h2 className="text-sm text-red-600">Payment information is not available.</h2>
      </div>
    );
  }

    const amount = Number(paymentRecord?.amount_in_local_currency ?? 0);
  const qrValue = paymentRecord.qr_string;


  return (
    <div className="min-w-4xl items-center flex flex-col self-center">
      <div className="flex flex-row items-center justify-between w-full">
        <GoBackBtn />
         <Link href={`/payments/qrcode/${case_id}/verify`}>
        <Button
       
          className="text-sm text-green-600 hover:cursor-pointer"
          variant="secondary"
        >
          Verify Payment
        </Button>
        </Link>
      </div>

      <Separator className="my-4 border-b border-gray-200" />

      <div className="space-y-3 w-min grid gap-6 max-w-4xl p-6 justify-center items-center border border-gray-300 rounded bg-white">
        <div className="space-y-2  p-4 rounded flex flex-col items-center">
          <QRCodeSVG value={qrValue} size={300} />
          <Separator className="my-6 border-b border-gray-200 " />
          <div className="text-xs break-all">
            Amount To Pay: <span className="font-semibold">{amount}</span>
          </div>
          <div className="text-xs break-all">
            Main Client:{" "}
            <span className="font-semibold">{paymentRecord.payerInfo}</span>
          </div>
          <div className="text-xs break-all">
            Case Number: <span className="font-semibold">{paymentRecord.case_id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
