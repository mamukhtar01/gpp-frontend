"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Country, ServiceType, FeeStructure } from "./page";
import CategoryTableSection from "./CategoryTableSection";

// ---- Helper functions ----
type ServiceMap = Record<string, ServiceType | undefined>;

function buildServiceMap(services: ServiceType[]): ServiceMap {
  const map: ServiceMap = {};
  for (const svc of services) {
    map[svc.service_code] = svc;
  }
  return map;
}

function getFeesForCountry(
  countryId: number,
  allFees: FeeStructure[]
): FeeStructure[] {
  return allFees.filter(
    (f) =>
      f.country_id === countryId &&
      f.is_active &&
      !!f.service_type_code // must have service code
  );
}

function groupFeesByCategory(
  fees: FeeStructure[],
  serviceMap: ServiceMap
): Record<string, FeeStructure[]> {
  const result: Record<string, FeeStructure[]> = {};
  for (const fee of fees) {
    const svc = serviceMap[fee.service_type_code ?? ""];
    const cat = svc?.category || "Other";
    if (!result[cat]) result[cat] = [];
    result[cat].push(fee);
  }
  return result;
}

type Props = {
  countries: Country[];
  services: ServiceType[];
  fees: FeeStructure[];
};

export default function PricingTabs({ countries, services, fees }: Props) {
  const [selectedCountryId, setSelectedCountryId] = React.useState<number>(countries[0]?.id ?? 0);

  const serviceMap = React.useMemo(() => buildServiceMap(services), [services]);

  return (
    <Tabs
      value={selectedCountryId.toString()}
      onValueChange={(v) => setSelectedCountryId(Number(v))}
      className="mb-8"
    >
      <TabsList className="w-full flex flex-wrap gap-2">
        {countries.map((country) => (
          <TabsTrigger
            key={country.id}
            value={country.id.toString()}
            className="flex-1 min-w-[140px]"
          >
            {country.country}
          </TabsTrigger>
        ))}
      </TabsList>
      {countries.map((country) => {
        const feesForCountry = getFeesForCountry(country.id, fees);
        const feesByCategory = groupFeesByCategory(feesForCountry, serviceMap);

        return (
          <TabsContent
            key={country.id}
            value={country.id.toString()}
            className="mt-8"
          >
            {Object.entries(feesByCategory).map(([category, cFees]) => (
              <CategoryTableSection
                key={category}
                category={category}
                fees={cFees}
                serviceMap={serviceMap}
              />
            ))}
            {Object.keys(feesByCategory).length === 0 && (
              <div className="text-muted-foreground mt-12 text-center">
                No packages available for this country.
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}