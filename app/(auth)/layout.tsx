import React from "react";
import Head from "next/head";

type Props = {
  children: React.ReactNode;
};

export default function LoginLayout({ children }: Props) {
  return (
    <html lang="en">
      <Head>
        <title>IOM - GPP</title>
        <link rel="icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="description"
          content="GPP Payments — generate QR and other payment methods"
        />
      </Head>
      <body>
        <div className="min-h-screen flex flex-col bg-gray-50 text-black">
          <main className=" mx-auto flex-1 w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
