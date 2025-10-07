import { createContext, useContext, useEffect, useState } from "react";
import { getExchangeRate } from "@/app/server_actions/pricing";

const ExchangeRateContext = createContext<{ rate: number | null }>({ rate: null });

export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
  const [rate, setRate] = useState<number | null>(null);
  useEffect(() => {
    getExchangeRate({ CurrencyId: 4 }).then(data => {
      if (data && data.length > 0) setRate(parseFloat(data[0].value));
    });
  }, []);
  return <ExchangeRateContext.Provider value={{ rate }}>{children}</ExchangeRateContext.Provider>;
}

export function useExchangeRate() {
  return useContext(ExchangeRateContext).rate;
}