// app/page.tsx (Next.js 13+ with App Router)
import Link from "next/link";
import Image from "next/image";

const paymentMethods = [
  { title: "QR PAYMENT", img: "/qrcode.png", value: "Generate QR Payment", href: "/payments/qrcode" },
  { title: "CASH PAYMENT", img: "/cash.png", value: "Create Cash Payment", href: "/payments/cash" },
  { title: "CREDIT PAYMENT", img: "/card.png", value: "Accept Card Payment", href: "/payments/credit-card" },
  { title: "DPO PAYMENT", img: "/card.png", value: "Accept DPO Payment", href: "/payments/dpo-payment" },
  { title: "BANK TRANSFER", img: "/bank.png", value: "Record Bank Transfer", href: "/payments/bank-transfer" },
  { title: "MOBILE MONEY", img: "/mobile.png", value: "Generate Mobile Payment", href: "/payments/mobile-money" },
];

const reportTypes = [
  { title: "END-OF-DAY", img: "/calendar.png", value: "Daily Summary", href: "/reports/end-of-day" },
  { title: "DAILY INCOME", img: "/cash.png", value: "Daily Income Summary", href: "/reports/daily-income" },
  { title: "DAILY QR CODE", img: "/qrcode.png", value: "Daily QR Code", href: "/reports/daily-qr" },
  { title: "RECONCILIATION", img: "/report.png", value: "Reconciliation", href: "/reports/reconciliation" },
  { title: "VACCINATION", img: "/file.svg", value: "Daily Vaccination", href: "/reports/vaccination" },
  { title: "ADDITIONAL INCOME", img: "/file.svg", value: "Additional Income", href: "/reports/placeholder-2" },
];

export default async function Home() {
  return (
    <main className="bg-[#f7f9fb] py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-stretch">
          {/* Payments Column */}
          <section className="flex-1">
            <h2 className="text-3xl font-semibold text-[#0b4b8a] tracking-wide">PAYMENTS</h2>
            <hr className="w-24 border-0 h-0.5 bg-[#e6eef8] mt-4 mb-8" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentMethods.map((m, i) => (
                <Link key={i} href={m.href}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 flex flex-col items-center justify-center h-36 sm:h-40">
                    <Image src={m.img} alt={m.title} width={72} height={72} className="mb-3 object-contain" />
                    <p className="text-sm font-semibold text-gray-800 text-center tracking-wide">{m.title}</p>
                    <p className="text-xs text-gray-400 mt-1 text-center">{m.value}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Vertical separator (hidden on small screens) */}
          <div className="hidden lg:block w-px bg-[#e6eef8] mx-6 self-stretch" />

          {/* Reports Column */}
          <section className="flex-1">
            <h2 className="text-3xl font-semibold text-[#0b4b8a] tracking-wide">REPORTS</h2>
            <hr className="w-24 border-0 h-0.5 bg-[#e6eef8] mt-4 mb-8" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((r, i) => (
                <Link key={i} href={r.href}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 flex flex-col items-center justify-center h-36 sm:h-40">
                    <Image src={r.img} alt={r.title} width={72} height={72} className="mb-3 object-contain" />
                    <p className="text-sm font-semibold text-gray-800 text-center tracking-wide">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-1 text-center">{r.value}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
