
import { getFeeStructures } from "@/app/server_actions/pricing";
import { AdditionalServicesPaymentPanel } from "@/components/payments/AdditionalServicesPaymentPanel";

export default async function AdditionalServicesPaymentPage() {
  // Server-side fetch (adjust to your actual data layer)
  const [ukFees, additionalServices] = await Promise.all([
  getFeeStructures({
      countryCode: 16,
       type: "medical_exam",
    }),                // if you still need fees for age (not used here, but kept for parity)
getFeeStructures({
      countryCode: 16,
      type: "special_service",
    }),    // MUST return AdditionalServiceFromDB[]
  ]);

  return (
    <div className="w-full flex justify-center px-4 py-10">
      <AdditionalServicesPaymentPanel
        additionalServices={additionalServices}
        ukFees={ukFees} // kept to align with existing patterns; can remove if unused
      />
    </div>
  );
}

