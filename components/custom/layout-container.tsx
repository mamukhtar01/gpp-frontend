import React from "react";

import Link from "next/link";
import Image from "next/image";

import MenuTop from "./top-navigation";
import Footer from "./footer";
import { SheetSidebarMenu } from "./sheet-sidebar";

type Props = {
  children: React.ReactNode;
};

export default function LayoutContainer({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] text-black">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Logo + title */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center">
              <Image src="/iom-logo.svg" alt="IOM" width={110} height={48} />
            </Link>
            <div className="h-10 w-0.5 bg-brand-600 opacity-30" />
            <span className="text-brand-500 font-semibold tracking-wide">
              GLOBAL PAYMENT PLATFORM
            </span>
          </div>

          {/* Right: Top navigation */}
          <div className="flex items-center justify-end">
            <MenuTop />
            <div className="hidden mx-3 md:block h-5 w-px bg-gray-200" />
          <SheetSidebarMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto flex-1 w-full">{children}</main>

      <Footer />
    </div>
  );
}
