import * as React from "react";
import { FeeStructure } from "./page";
import FeesTable from "./FeeTable";
import type { ServiceMap } from "./FeeTable";

type Props = {
  category: string;
  fees: FeeStructure[];
  serviceMap: ServiceMap;
};

export default function CategoryTableSection({ category, fees, serviceMap }: Props) {
  const normalFees = fees.filter((fee) => !fee.special_case);
  const specialCaseFees = fees.filter((fee) => fee.special_case);

  // Sort for readability
  const sortFn = (a: FeeStructure, b: FeeStructure) => {
    const svcA = serviceMap[a.service_type_code ?? ""];
    const svcB = serviceMap[b.service_type_code ?? ""];
    if ((svcA?.service_name ?? "") < (svcB?.service_name ?? "")) return -1;
    if ((svcA?.service_name ?? "") > (svcB?.service_name ?? "")) return 1;
    return 0;
  };

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-2 capitalize">
        {category.replace(/_/g, " ")}
      </h2>
      {normalFees.length > 0 && (
        <div className="overflow-x-auto mb-7">
          <FeesTable
            fees={normalFees.sort(sortFn)}
            serviceMap={serviceMap}
            showSpecialCase={false}
          />
        </div>
      )}
      {specialCaseFees.length > 0 && (
        <div className="overflow-x-auto">
          <div className="mb-1 font-semibold text-[15px] text-blue-700">
            Special Cases
          </div>
          <FeesTable
            fees={specialCaseFees.sort(sortFn)}
            serviceMap={serviceMap}
            showSpecialCase={true}
          />
        </div>
      )}
    </div>
  );
}