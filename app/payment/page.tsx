'use client';

import NepalQRPanel from "@/components/payments/NepalQrCodePanel";


export default function PaymentsPage() {

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <NepalQRPanel amount={23} billNumber="BILL123" />
    </div>
  );
}
