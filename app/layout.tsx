import Head from "next/head";
import "./_css/globals.css";
import { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "IOM - GPP",
  description: "IOM Global Payment Platform",
  
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" >
      <Head>
        <title>IOM - PPO</title>
        <link rel="icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="description"
          content="GPP Payments — generate QR and other payment methods"
        />
      </Head>
      <body > {children} </body>
    </html>
  );
}
