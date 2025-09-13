import localFont from "next/font/local";
import "./_css/globals.css";
import { Metadata } from "next";
import Head from "next/head";

const gillSansNova = localFont({
  src: [
    {
      path: "../public/fonts/GillSansNova-Book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/GillSansNova-BookItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/GillSansNova-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/GillSansNova-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/GillSansNova-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/GillSansNova-SemiBoldItalic.otf",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-gillsansnova", // Creates CSS variable
  display: "swap", // improves rendering
})




type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "IOM - GPP",
  description: "IOM Global Payment Platform", 
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={gillSansNova.variable}>
    <Head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
    </Head>
  <body>{children}</body>
    </html>
  );
}
