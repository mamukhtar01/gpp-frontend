import Link from "next/link";
import { LogIn } from "lucide-react";
import { getUserData } from "@/lib/dal";



export default async function MenuTop() {
  const userData = await getUserData();

  return (
    <nav className="flex items-center text-sm text-gray-600 pr-2">
      <div className="flex items-center space-x-6">
        <Link href="/" className="hidden md:inline hover:text-gray-900">
          Home
        </Link>

        <Link href="/payments/status" className="hidden md:inline hover:text-gray-900">
          Payment Status
        </Link>

        <div className="hidden md:block h-5 w-px bg-gray-200" />

        <div className="flex items-center">
          {userData?.success ? (
            <Link href="/profile" className="hover:text-gray-900 text-sm">
              {userData?.user?.first_name}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-gray-900 text-sm">
              <LogIn className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
