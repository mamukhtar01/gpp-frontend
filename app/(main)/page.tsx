// app/page.tsx (Next.js 13+ with App Router)
import Link from "next/link";
import { CreditCard, Wallet, Landmark, Smartphone, QrCode } from "lucide-react";


const paymentMethods = [
  { title: "QR Payment", icon: <QrCode size={32} />, value: "Generate QR Payment", href: "/payments/qrcode" },
  { title: "Cash Payment", icon: <Wallet size={32} />, value: "Create Cash Payment", href: "/payments/cash" },
  { title: "Credit Card", icon: <CreditCard size={32} />, value: "Accept Card Payment", href: "/payments/credit-card" },
  { title: "Bank Transfer", icon: <Landmark size={32} />, value: "Record Bank Transfer", href: "/payments/bank-transfer" },
  { title: "Mobile Money", icon: <Smartphone size={32} />, value: "Generate Mobile Payment", href: "/payments/mobile-money" },
];

export default async function Home() {

//  const response = await getUserData();
  

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Create Payment</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {paymentMethods.map((method, idx) => (
          <Link key={idx} href={method.href}>
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-center justify-center cursor-pointer">
              <div className="mb-3 text-gray-700">{method.icon}</div>
              <p className="text-lg font-semibold text-gray-800 text-center">{method.title}</p>
              <p className="text-sm text-gray-500 mt-2">{method.value}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
