import Link from "next/link";
import { LogIn } from "lucide-react";
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
     
      <Link href="/login" className="flex items-center hover:text-gray-900">
       <LogIn className="mr-1 h-4 w-4" />
        Login
      </Link>
    </nav>
  );
}
