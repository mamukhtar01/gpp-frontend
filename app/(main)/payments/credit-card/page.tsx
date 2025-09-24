// app/page.tsx (Next.js 13+ with App Router)




import Link from "next/link";
import Image from "next/image";

const cardPaymentMethods = [
  {
    title: "DPO Card Payment",
    img: "/card.png",
    value: "Accept DPO Card Payment",
    href: "/payments/dpo-payment",
  },
  {
    title: "Stripe Card Payment",
    img: "/card.png",
    value: "Accept Stripe Card Payment",
    href: "/payments/stripe-payment",
  },
  {
    title: "Flutterwave Card Payment",
    img: "/card.png",
    value: "Accept Flutterwave Card Payment",
    href: "/payments/flutterwave-payment",
  },
  {
    title: "PayPal Card Payment",
    img: "/card.png",
    value: "Accept PayPal Card Payment",
    href: "/payments/paypal-payment",
  },
  {
    title: "Bank Card Payment",
    img: "/card.png",
    value: "Accept Bank Card Payment",
    href: "/payments/bank-card-payment",
  },
];


export default function CreditCardPage() {
  return (
    <main className="bg-[#f7f9fb] py-10 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-brand-400 tracking-wide mb-2">Card Payment Methods</h2>
        <hr className="w-24 border-0 h-0.5 bg-[#e6eef8] mt-2 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardPaymentMethods.map((m, i) => (
            <Link key={i} href={m.href}>
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 flex flex-col items-center justify-center h-36 sm:h-40 transition cursor-pointer">
                <Image
                  src={m.img}
                  alt={m.title}
                  width={72}
                  height={72}
                  className="mb-3 object-contain"
                />
                <p className="text-lg font-semibold text-gray-800 text-center tracking-wide">
                  {m.title}
                </p>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  {m.value}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
