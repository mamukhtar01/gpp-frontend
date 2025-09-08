import Link from "next/link";
import { LogIn } from "lucide-react";
import { getUserData } from "@/lib/dal";



export default async function MenuTop() {
  const userData = await getUserData();

  return (
    <nav className="flex items-center space-x-4 text-sm text-gray-600">
      <Link href="/" className="hover:text-gray-900">
        Home
      </Link>
      <Link href="/payments/status" className="hover:text-gray-900">
        Payment Status
      </Link>
      

      {userData?.success ? (
        <Link href="/profile" className="hover:text-gray-900">
          {userData?.user?.first_name}  
        </Link>
      ) : (
        <Link href="/login" className="hover:text-gray-900">
          <LogIn className="h-4 w-4" />
        </Link>
      )}
      </nav>
    );
  }
