import { getFeeStructuresAction } from "@/app/server_actions/pricing";
import { VaccinationCashPaymentPanel } from "@/components/payments/VaccinationCashPaymentPanel";

export default async function AdditionalServicesPaymentPage() {
  
  // Server-side fetch
  const additionalServices = await getFeeStructuresAction({
    countryCode: 13,
    type: "vaccination",
  }); 

  return (
    <div className="w-full flex justify-center px-4 py-10">
      <VaccinationCashPaymentPanel additionalServices={additionalServices} />
    </div>
  );
}
