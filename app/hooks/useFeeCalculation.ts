import { useMemo } from "react";
import { CalculateAge, getFeeByAge } from "@/lib/utils";
import { FeeStructure } from "@/app/types";
import { TUKTB_Cases } from "@/lib/schema";

export function useFeeCalculation(
  clients: TUKTB_Cases[],
  ukFees: FeeStructure[],
  addedServices: Record<string, { fee_amount_usd: string }[]>,
  exchangeRate?: number
) {
  const getBaseFee = (client: TUKTB_Cases) =>
    getFeeByAge(ukFees, CalculateAge(client.date_of_birth) ?? 0) ?? 0;
  const getClientTotal = (client: TUKTB_Cases) => {
    const adds = (addedServices[client.id] || []).reduce(
      (acc, s) => acc + parseFloat(s.fee_amount_usd),
      0
    );
    return getBaseFee(client) + adds;
  };

  const grandTotalUSD = useMemo(
    () => clients.reduce((sum, c) => sum + getClientTotal(c), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clients, addedServices]
  );

  const grandTotalLocal = useMemo(() => {
    if (!exchangeRate) return null;
    return grandTotalUSD * exchangeRate;
  }, [grandTotalUSD, exchangeRate]);

  return { getBaseFee, getClientTotal, grandTotalUSD, grandTotalLocal };
}