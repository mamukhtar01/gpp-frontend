'use client';

import { useState } from 'react';
import { createPayment } from '@/lib/directus';
// import QRCode from 'qrcode.react';

export default function PaymentsPage() {
  const [amount, setAmount] = useState('');
  const [qrData, setQrData] = useState('');

  const handleGenerate = async () => {
    const payment = await createPayment({
      amount,
      status: 'pending'
    });

    // For now, QR just contains payment ID
    setQrData(`PAYMENT_ID:${payment.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-4">Generate QR Payment</h1>
      <div className="bg-white shadow-lg p-6 rounded-xl w-full max-w-md">
        <label className="block mb-2 font-semibold">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />
        <button
          onClick={handleGenerate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate QR
        </button>

        {qrData && (
          <div className="mt-6 flex flex-col items-center">
            {/* <QRCode value={qrData} size={200} /> */}
            <p className="mt-2 text-gray-500">Scan this QR to pay</p>
          </div>
        )}
      </div>
    </div>
  );
}
