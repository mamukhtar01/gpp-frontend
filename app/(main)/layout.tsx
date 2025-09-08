import type { Metadata } from "next";

import "../_css/globals.css";
import LayoutContainer from "@/components/custom/layout-container";

export const metadata: Metadata = {
  title: "IOM - GPP",
  description: "IOM Global Payment Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{<LayoutContainer>{children}</LayoutContainer>}</>;
}
