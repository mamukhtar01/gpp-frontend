import { CashPaymentPanel } from "@/components/payments/cash-payment-panel";


export default function CashPage() {
  return (
    <div className="flex flex-col justify-center items-center my-10 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold">Cash Payment</h2>
      {/* Search Case Number */}
      <div className="mt-4 w-full p-6 bg-white rounded shadow">
        <p className="text-gray-600 my-4">Search Case Number component goes here.</p>
        <CashPaymentPanel />
      </div>  
    </div>
  );
}
