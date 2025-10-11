"use client";
import React, { useState } from "react";
import { Separator } from "@radix-ui/react-separator";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPayment } from "@/app/server_actions";
import { AdditionalServiceFromDB, FeeStructure, TNewPaymentRecord } from "@/app/types";
import { useExchangeRate } from "@/app/(main)/payments/exchangeRateContext";
import { Banknote, Loader2 } from "lucide-react";
import { TUKTB_Cases } from "@/lib/schema";
import { useRemarks } from "@/app/hooks/useRemarks";
import { useAdditionalServices } from "@/app/hooks/useAdditionalServices";
import { useFeeCalculation } from "@/app/hooks/useFeeCalculation";
import { ExchangeRateWidget } from "../exchangeRateWidget";
import { SearchUKTBCombobox } from "./search-uktbcase-combobox";
import { PaymentClientsTable } from "../custom/PaymentClientsTable";
import { AdditionalServiceDialog } from "../custom/AdditionalServiceDialog";
import { createUKTBPaymentRecord } from "@/lib/utils";

export function UKTBCashPaymentPanel({
  ukFees,
  additionalServicesList,
}: {
  ukFees: FeeStructure[];
  additionalServicesList: AdditionalServiceFromDB[];
}) {
  const router = useRouter();
  const [selectedCase, setSelectedCase] = useState<TUKTB_Cases | null>(null);
  const [ukTBCases, setUkCases] = useState<TUKTB_Cases[]>([]);
  const exchangeRate = useExchangeRate();
  const [loading, setLoading] = useState(false);

  const remarksHook = useRemarks();
  const additionalServicesHook = useAdditionalServices(ukTBCases, additionalServicesList);

  const {
   
    getClientTotal,
    grandTotalUSD,
    grandTotalLocal,
  } = useFeeCalculation(
    ukTBCases,
    ukFees,
    additionalServicesHook.addedServices,
    exchangeRate || undefined
  );

  const handleCashPayment = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const qrFields = null; // No QR fields for cash payment
      

      // Reuse the shared helper!
      const paymentRecord: TNewPaymentRecord = {
        ...createUKTBPaymentRecord(
          selectedCase,
          ukTBCases,
          getClientTotal,
          remarksHook.remarks,
          additionalServicesHook.addedServices,
          grandTotalUSD,
          grandTotalLocal,
          exchangeRate,
          qrFields
        ),
        // Override for cash payment
        type_of_payment: 3, // Cash Payment
        status: 2, // Paid
        qr_string: "", // No QR for cash
        validationTraceId: "",
        qr_timestamp: "",
      };

      const paymentRes = await createPayment(paymentRecord);
      if (!paymentRes) throw new Error("Failed to create payment record");
      router.push(`/payments/cash/${selectedCase.id}?case_type=uktb`);
    } catch (e) {
      alert(`Failed to create payment record: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded shadow w-full max-w-6xl min-h-[470px] flex flex-col bg-white">
      <ExchangeRateWidget exchangeRate={exchangeRate} className="mb-4" />
      <SearchUKTBCombobox setSelectedCase={setSelectedCase} setUkCases={setUkCases} ukFees={ukFees} />
      <Separator className="my-8" />
      {selectedCase && (
        <>
          <PaymentClientsTable
            clients={ukTBCases}
            getClientTotal={getClientTotal}
            remarks={remarksHook.remarks}
            onRemarkChange={remarksHook.setRemark}
            onRemoveClient={(id) => {
              setUkCases((prev) => prev.filter((c) => c.id !== id));
              additionalServicesHook.setAddedServices((prev) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [id]: _, ...rest } = prev;
                return rest;
              });
              remarksHook.removeRemark(id);
            }}
            onAddServiceClick={(id) => {
              additionalServicesHook.setActiveClientId(id);
              additionalServicesHook.setIsServiceDialogOpen(true);
            }}
            addedServices={additionalServicesHook.addedServices}
            removeService={additionalServicesHook.removeService}
            grandTotalUSD={grandTotalUSD}
            grandTotalLocal={grandTotalLocal}
            exchangeRate={exchangeRate || undefined}
          />
          <AdditionalServiceDialog
            open={additionalServicesHook.isServiceDialogOpen}
            onOpenChange={additionalServicesHook.setIsServiceDialogOpen}
            activeClientId={additionalServicesHook.activeClientId}
            selectedServiceId={additionalServicesHook.selectedServiceId}
            setSelectedServiceId={additionalServicesHook.setSelectedServiceId}
            availableServices={additionalServicesHook.availableServicesForActiveClient}
            handleAddService={additionalServicesHook.handleAddService}
          />
          <Separator className="my-16" />
          <div className="flex gap-6 mt-2 justify-between">
            <button
              onClick={handleCashPayment}
              disabled={loading || grandTotalUSD <= 0 || !exchangeRate}
              className="flex items-center justify-center h-12 w-[240px] rounded-md bg-brand-500 text-white font-bold text-base shadow-sm hover:bg-brand-600 hover:cursor-pointer transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Cash Payment...
                </>
              ) : (
                <>
                  Create Cash Payment
                  <Banknote className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
            <button
              onClick={() => {
                setSelectedCase(null);
                setUkCases([]);
                additionalServicesHook.setAddedServices({});
                remarksHook.resetRemarks();
                additionalServicesHook.setActiveClientId(null);
                additionalServicesHook.setSelectedServiceId(null);
              }}
              className="flex items-center justify-center h-12 w-[140px] rounded-md border border-brand-700 text-brand-500 font-bold text-base bg-white hover:cursor-pointer hover:bg-blue-50 transition"
            >
              RESET FIELD
            </button>
          </div>
        </>
      )}
      <div className="mt-auto ml-auto">
        <Link href="/uktb-case/register" className="text-blue-500 hover:underline">
          Create New Case
        </Link>
      </div>
    </div>
  );
}