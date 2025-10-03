import { getFeeStructures } from "@/app/server_actions/pricing";
import { VaccinationServicesPaymentPanel } from "@/components/payments/VaccinationServicesPaymentPanel";

export default async function AdditionalServicesPaymentPage() {
  
  // Server-side fetch
  const additionalServices = await getFeeStructures({
    countryCode: 13,
    type: "vaccination",
  }); 

  return (
    <div className="w-full flex justify-center px-4 py-10">
      <VaccinationServicesPaymentPanel additionalServices={additionalServices} />
    </div>
  );
}
