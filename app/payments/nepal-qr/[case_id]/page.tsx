"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Separator } from "@radix-ui/react-separator";
import { useCaseContext } from "@/app/payments/nepal-qr/caseContext";

export default function NepalQRCodePanel({ params }: { params: { case_id: string } }) {
    const { caseData } = useCaseContext();


    console.log(caseData);


  return (
    <div className="space-y-3 grid  gap-6 max-w-4xl w-full p-6 justify-center items-center border border-gray-300 rounded bg-white">
    
        <div className="space-y-2 bg-white p-4 rounded flex flex-col items-center">
          <QRCodeSVG value={"523432432dfpiadfafd098afd"} size={400} />
          <Separator className="my-6 border-b border-gray-200 " />
          <div className="text-xs break-all">Amount To Pay: <span className="font-semibold">{"$125"}</span></div>
          <div className="text-xs break-all">Main Client: <span className="font-semibold">{"Abdi Farah"}</span></div>
          <div className="text-xs break-all">Case Number: <span className="font-semibold">{"KE1234567890"}</span></div>
        </div>
     
    </div>
  );
}
