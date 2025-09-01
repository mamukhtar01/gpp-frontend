import Link from "next/link";

export default function MenuTop() {
  return (
    <nav className="flex items-center space-x-4 text-sm text-gray-600">
      <Link href="/" className="hover:text-gray-900">
        Home
      </Link>
      <Link href="/payment/nepal-qr" className="hover:text-gray-900">
        Nepal QR
      </Link>
      <Link href="/payment/stripe" className="hover:text-gray-900">
        Stripe
      </Link>
      <Link href="/payment/dpo" className="hover:text-gray-900">
        DPO
      </Link>
      <Link href="/payment/cash" className="hover:text-gray-900">
        Cash
      </Link>
    </nav>
  );
}
