// context/AppContext.tsx
"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";


export interface TCase {
  case_id: string | null;      
  case_status: number;         
  date_created: string;         
  id: string;                   
  main_client: string;
  package_price: string | null;        
}

type QRData = {
  qrString: string;
  validationTraceId?: string;
} | null;

type CaseContextType = {
  caseData: TCase | null;
  qrData: QRData;
  setCaseData: (data: TCase | null) => void;
  setQrData: (data: QRData) => void;
};

const CaseContext = createContext<CaseContextType | undefined>(undefined);

const KEY_CASE = "nepalqr.caseData";
const KEY_QR = "nepalqr.qrData";

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [caseData, setCaseDataState] = useState<TCase | null>(null);
  const [qrData, setQrDataState] = useState<QRData>(null);

  // hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const rawCase = sessionStorage.getItem(KEY_CASE);
      if (rawCase) setCaseDataState(JSON.parse(rawCase));
      const rawQr = sessionStorage.getItem(KEY_QR);
      if (rawQr) setQrDataState(JSON.parse(rawQr));
    } catch (e) {
      console.error("Failed to hydrate CaseProvider from sessionStorage", e);
    }
  }, []);

  // setters that persist
  const setCaseData = useCallback((data: TCase | null) => {
    setCaseDataState(data);
    try {
      if (data === null) sessionStorage.removeItem(KEY_CASE);
      else sessionStorage.setItem(KEY_CASE, JSON.stringify(data));
    } catch {}
  }, []);

  const setQrData = useCallback((data: QRData) => {
    setQrDataState(data);
    try {
      if (!data) sessionStorage.removeItem(KEY_QR);
      else sessionStorage.setItem(KEY_QR, JSON.stringify(data));
    } catch {}
  }, []);

  return (
    <CaseContext.Provider value={{ caseData, qrData, setCaseData, setQrData }}>
      {children}
    </CaseContext.Provider>
  );
}

export function useCaseContext() {
  const context = useContext(CaseContext);
  if (!context) throw new Error("useCaseContext must be used inside CaseProvider");
  return context;
}
