"use client";
import { ExchangeRateProvider } from "./exchangeRateContext";


export default function NepalQRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="nepal-qr-layout flex w-full justify-center my-8">
        <ExchangeRateProvider>
          {children}
        </ExchangeRateProvider>
    </div>
  );
}
