import countriesRaw from "./countries.json";
import PricingTabs from "./PricingTabs";
import { getFeeStructures, getServiceTypes } from "@/app/server_actions";

// ---- Types ----
export type Country = {
  id: number;
  country: string;
  country_code: string;
  status: string;
};

export type ServiceType = {
  service_code: string;
  service_name: string;
  category: string;
  description: string | null;
  is_active: boolean;
};

export type FeeStructure = {
  id: number;
  country_id: number | null;
  service_type_code: string | null;
  age_bracket_display: string | null;
  min_age_months: number | null;
  max_age_months: number | null;
  visa_type: string | null;
  special_case: string | null;
  fee_amount_usd: string | null;
  description: string | null;
  is_active: boolean;
};

// ---- Only included countries ----
const COUNTRY_IDS = [12, 13, 14, 15, 16, 29];

export default async function PricingPage() {


  // Fee structure server action 

  const feeStructureData =  await getFeeStructures();
  const servicesData = await getServiceTypes();
  if (!feeStructureData || !servicesData) {
    throw new Error("Failed to load pricing data");
  }



  const allFees: FeeStructure[] = feeStructureData;
  const allServices: ServiceType[] = servicesData;


 
  const countryList: Country[] = countriesRaw.data
    .filter((c: Country) => COUNTRY_IDS.includes(c.id))
    .map((c: Country) => ({
      id: c.id,
      country: c.country,
      country_code: c.country_code,
      status: c.status,
    }));

  return (
    <div className="max-w-7xl mx-auto py-10 md:px-10 px-6">
      <h1 className="text-3xl font-bold mb-10 ">Pricing Packages</h1>
      <PricingTabs
        countries={countryList}
        services={allServices}
        fees={allFees}
      />
    </div>
  );
}