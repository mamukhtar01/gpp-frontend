// context/AppContext.tsx
"use client";
import { createContext, useContext, useState } from "react";

type CaseContextType = {
  caseData: unknown;
  setCaseData: (data: unknown) => void;
};

const CaseContext    = createContext<CaseContextType | undefined>(undefined);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [caseData, setCaseData] = useState<unknown>(null);

  return (
    <CaseContext.Provider value={{ caseData, setCaseData }}>
      {children}
    </CaseContext.Provider>
  );
}

export function useCaseContext() {
  const context = useContext(CaseContext);
  if (!context) throw new Error("useCaseContext must be used inside CaseProvider");
  return context;
}
