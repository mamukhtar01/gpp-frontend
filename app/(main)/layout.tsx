import type { Metadata } from "next";

import "./_css/globals.css";
import LayoutContainer from "@/components/custom/layout-container";
import path from "path";

export const metadata: Metadata = {
  title: "IOM - GPP",
  description: "IOM Global Payment Platform",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: unknown
}>) {


  const pathname =  await params;
  console.log("Params in layout:", pathname);


  const noLayout = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  return (
    <>
      {(
        <LayoutContainer>{children}</LayoutContainer>
      )}
    </>
  );
}
