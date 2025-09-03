// app/page.tsx (Next.js 13+ with App Router)
import Link from "next/link";
import { CreditCard, Wallet, Landmark, Smartphone, QrCode } from "lucide-react";

const paymentMethods = [
  { title: "Credit Card", icon: <CreditCard size={32} />, value: "**** 1234", href: "/credit-card" },
  { title: "Bank Transfer", icon: <Landmark size={32} />, value: "3 Pending", href: "/bank-transfer" },
  { title: "Mobile Money", icon: <Smartphone size={32} />, value: "Active", href: "/mobile-money" },
  { title: "QR Payments", icon: <QrCode size={32} />, value: "5 New", href: "/qr-payments" },
  { title: "Wallet Balance", icon: <Wallet size={32} />, value: "$245.90", href: "/wallet" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Payment Methods</h1>
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
