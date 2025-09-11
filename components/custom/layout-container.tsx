import React from "react";

import Link from "next/link";
import Image from "next/image";

import MenuTop from "./top-navigation";
import Footer from "./footer";

type Props = {
  children: React.ReactNode;
};

export default function LayoutContainer({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-black">
      <header className="bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/iom-logo.svg" alt="" width={100} height={47} />
            <span className="ml-6 font-semibold text-lg">
              Global Payment Platform
            </span>
          </Link>
          <MenuTop />
        </div>
      </header>

      <main className=" mx-auto flex-1 w-full">{children}</main>

      <Footer />
    </div>
  );
}
