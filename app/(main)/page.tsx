// app/page.tsx (Next.js 13+ with App Router)
import Link from "next/link";
import { CreditCard, Wallet, Landmark, Smartphone, QrCode } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";


const paymentMethods = [
  { title: "QR Payment", icon: <QrCode size={32} />, value: "Generate QR Payment", href: "/payments/qrcode" },
  { title: "Cash Payment", icon: <Wallet size={32} />, value: "Create Cash Payment", href: "/payments/cash" },
  { title: "Credit Card", icon: <CreditCard size={32} />, value: "Accept Card Payment", href: "/payments/credit-card" },
  { title: "DPO Payment", icon: <CreditCard size={32} />, value: "Accept DPO Payment", href: "/payments/dpo-payment" },
  { title: "Bank Transfer", icon: <Landmark size={32} />, value: "Record Bank Transfer", href: "/payments/bank-transfer" },
  { title: "Mobile Money", icon: <Smartphone size={32} />, value: "Generate Mobile Payment", href: "/payments/mobile-money" },
];

export default async function Home() {

//  const response = await getUserData();
  

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">Create Payment</h1>
      <Separator className="mb-8  border-gray-200 border-b-1" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
        {paymentMethods.map((method, idx) => (
          <Link key={idx} href={method.href}>
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-center justify-center cursor-pointer">
              <div className="mb-3 text-blue-900">{method.icon}</div>
              <p className="text-lg font-semibold text-gray-800 text-center">{method.title}</p>
              <p className="text-sm text-gray-500 mt-2">{method.value}</p>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </main>
  );
}
