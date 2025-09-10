import { CashPaymentPanel } from "@/components/payments/cash-payment-panel";
import { Separator } from "@radix-ui/react-separator";

export default function CashPage() {
  return (
    <div className="my-10 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold ">Cash Payment</h2>
      <Separator className="mb-8 border-gray-200 border-b" />
      {/* Search Case Number */}
      <div className="w-full">
        <p className="text-gray-400 my-4 text-sm">
          Search Case Number component goes here.
        </p>
        <CashPaymentPanel />
      </div>
    </div>
  );
}
