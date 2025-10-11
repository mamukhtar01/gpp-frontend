import { getFeeStructuresAction } from "@/app/server_actions/pricing";
import { VaccinationServicesPaymentPanel } from "@/components/payments/VaccinationServicesPaymentPanel";

export default async function AdditionalServicesPaymentPage() {
  
  // Server-side fetch
  const additionalServices = await getFeeStructuresAction({
    countryCode: 13,
    type: "vaccination",
  }); 

  return (
    <div className="w-full flex flex-col justify-center items-center px-4 py-10">
      <div className="w-6xl">
        <h2 className="text-2xl font-light mb-4 mr-auto">Vaccination Payment {" "}
          <span className="font-mono">(US)</span>  </h2>
        <VaccinationServicesPaymentPanel additionalServices={additionalServices} />
      </div>
    </div>
  );
}
