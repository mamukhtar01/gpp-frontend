"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Plus, X, Trash2, Loader2 } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchUKTBCombobox } from "./search-uktbcase-combobox";
import { TUKTB_Cases } from "@/lib/schema";
import { TClientBasicInfo, TNewPaymentRecord } from "@/app/types";
import { CalculateAge } from "@/lib/utils";
import { createPayment } from "@/app/server_actions";
import { useExchangeRate } from "@/app/(main)/payments/exchangeRateContext";
import {
  CountryOfDestination,
  TCountryKey,
  COUNTRY_OPTIONS,
} from "./country-of-destination-select";

/* =========================================================
   TYPES
========================================================= */
export interface AdditionalServiceFromDB {
  id: number;
  fee_amount_usd: string;
  min_age_months: number | null;
  max_age_months: number | null;
  service_type_code: {
    service_code: string;
    category: string;
    service_name: string;
  };
}

interface AddedServiceInstance extends AdditionalServiceFromDB {
  instanceId: string;
}

type AddedServicesState = Record<string, AddedServiceInstance[]>;
type RemarksState = Record<string, string>;

export function AdditionalServicesPaymentPanel() {
  const router = useRouter();

  // Country selection
  const [country, setCountry] = useState<TCountryKey>(COUNTRY_OPTIONS[0].key);

  // Additional services state from API
  const [additionalServices, setAdditionalServices] = useState<
    AdditionalServiceFromDB[]
  >([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Case & clients
  const [selectedCase, setSelectedCase] = useState<TUKTB_Cases | null>(null);
  const [ukTBCases, setUkTBCases] = useState<TUKTB_Cases[]>([]);

  // Per‑client data
  const [addedServices, setAddedServices] = useState<AddedServicesState>({});
  const [remarks, setRemarks] = useState<RemarksState>({});

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [serviceSelectId, setServiceSelectId] = useState<number | null>(null);

  // Loading
  const [loading, setLoading] = useState(false);

  // Exchange rate
  const exchangeRate = useExchangeRate();

  // Fetch additional services when country changes
  useEffect(() => {
    async function fetchServices() {
      setServicesLoading(true);
      try {
        const res = await fetch(
          `/api/payments/fee-structures?countryCode=${country}&serviceType=excluded_med_exam`
        );
        if (!res.ok) throw new Error("Failed to fetch additional services");
        const data = await res.json();
        setAdditionalServices(data ?? []);
      } catch (e) {
        setAdditionalServices([]);
      } finally {
        setServicesLoading(false);
      }
    }
    fetchServices();
  }, [country]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const availableServicesForClient = useMemo(() => {
    if (!activeClientId) return additionalServices;
    const used = new Set(
      (addedServices[activeClientId] || []).map((s) => s.id)
    );
    return additionalServices.filter((s) => !used.has(s.id));
  }, [activeClientId, addedServices, additionalServices]);

  // Only sum up additional services, no age-based fee
  const getClientTotal = (clientId: string) =>
    (addedServices[clientId] || []).reduce(
      (sum, svc) => sum + parseFloat(svc.fee_amount_usd),
      0
    );

  const grandTotal = useMemo(
    () => ukTBCases.reduce((sum, c) => sum + getClientTotal(c.id), 0),
    [ukTBCases, addedServices]
  );

  const grandTotalLocal = useMemo(
    () => (exchangeRate ? grandTotal * exchangeRate : null),
    [grandTotal, exchangeRate]
  );

  const hasAnyServiceSelected = useMemo(
    () => Object.values(addedServices).some((arr) => arr.length > 0),
    [addedServices]
  );

  const currentStep = !selectedCase
    ? 1
    : ukTBCases.length === 0
    ? 2
    : !hasAnyServiceSelected
    ? 3
    : 4;

  /* =========================================================
     ACTIONS: Services & Clients
  ========================================================= */

  function openAddServiceDialog(clientId: string) {
    setActiveClientId(clientId);
    setServiceSelectId(null);
    setIsDialogOpen(true);
  }

  function confirmAddService() {
    if (!activeClientId || !serviceSelectId) return;
    const svc = additionalServices.find((s) => s.id === serviceSelectId);
    if (!svc) return;

    setAddedServices((prev) => ({
      ...prev,
      [activeClientId]: [
        ...(prev[activeClientId] || []),
        { ...svc, instanceId: `svc-${Date.now()}-${Math.random()}` },
      ],
    }));

    setIsDialogOpen(false);
    setServiceSelectId(null);
    setActiveClientId(null);
  }

  function removeService(clientId: string, instanceId: string) {
    setAddedServices((prev) => ({
      ...prev,
      [clientId]: prev[clientId].filter((s) => s.instanceId !== instanceId),
    }));
  }

  function removeClient(clientId: string) {
    setUkTBCases((prev) => prev.filter((c) => c.id !== clientId));
    setAddedServices((prev) => {
      const { [clientId]: _, ...rest } = prev;
      return rest;
    });
    setRemarks((prev) => {
      const { [clientId]: __, ...rest } = prev;
      return rest;
    });
  }

  function resetAll() {
    setSelectedCase(null);
    setUkTBCases([]);
    setAddedServices({});
    setRemarks({});
    setActiveClientId(null);
    setServiceSelectId(null);
  }

  /* =========================================================
     PAYMENT
  ========================================================= */
  async function handleCreatePayment() {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const totalAmount = grandTotal.toFixed(2);

      // Use local currency if exchange rate is available
      const amountInLocal = exchangeRate
        ? (grandTotal * exchangeRate).toFixed(2)
        : totalAmount;

      const qrRes = await fetch("/api/nepalpay/generateQR", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionCurrency: "524",
          transactionAmount: Number(amountInLocal),
          billNumber: selectedCase.id ?? "N/A",
          storeLabel: "Store1",
          terminalLabel: "Terminal1",
          purposeOfTransaction: "Bill payment",
        }),
      });

      const qrJson = await qrRes.json();
      if (
        !qrRes.ok ||
        !qrJson?.data?.qrString ||
        !qrJson?.data?.validationTraceId
      ) {
        throw new Error("QR generation failed");
      }

      const { qrString, validationTraceId, timestamp } = qrJson.data;

      const clientsInfo = ukTBCases.map((c) => ({
        id: c.id,
        name: `${c.First_Name} ${c.Last_Name}`,
        age: CalculateAge(c.date_of_birth),
        amount: getClientTotal(c.id).toFixed(2),
        remark: remarks[c.id] || null,
        additional_services: (addedServices[c.id] || []).map((s) => ({
          id: s.id,
          fee_amount_usd: s.fee_amount_usd,
          service_code: s.service_type_code.service_code,
          service_name: s.service_type_code.service_name,
        })),
      }));

      const paymentRecord: TNewPaymentRecord = {
        case_number: selectedCase.id,
        case_management_system: 2,
        mimosa_case: null,
        reference: null,
        amount_in_dollar: totalAmount,
        amount_in_local_currency: amountInLocal,
        type_of_payment: 2,
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`,
        status: 1,
        validationTraceId: validationTraceId ?? "",
        payerInfo: `${selectedCase.First_Name || ""} ${
          selectedCase.Last_Name || ""
        }`.trim(),
        qr_timestamp: timestamp ?? "",
        paidAmount: amountInLocal,
        qr_string: qrString,
        wave: null,
        clinic: null,
        clients: clientsInfo as TClientBasicInfo[],
        service_type: "special_service",
        destination_country: country,
        exchange_rate: exchangeRate,
      };

     const paymentRes = await createPayment(paymentRecord);
      router.push(
        `/payments/qrcode/${selectedCase.id}?paymentId=${paymentRes.id}`
      );
    } catch (e: unknown) {
      alert(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     UI SUB‑COMPONENTS
  ========================================================= */

  const StepChip = ({ step, label }: { step: number; label: string }) => {
    const state =
      step < currentStep
        ? "completed"
        : step === currentStep
        ? "current"
        : "upcoming";
    return (
      <span
        className={[
          "flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition",
          state === "completed" &&
            "border-green-500 bg-green-50 text-green-700",
          state === "current" &&
            "border-brand-600 bg-brand-50 text-brand-700 shadow-sm",
          state === "upcoming" && "border-slate-200 bg-slate-50 text-slate-500",
        ].join(" ")}
      >
        <span
          className={[
            "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
            state === "completed" && "border-green-500 bg-green-500 text-white",
            state === "current" && "border-brand-600 bg-brand-600 text-white",
            state === "upcoming" && "border-slate-300 bg-white text-slate-500",
          ].join(" ")}
        >
          {state === "completed" ? "✓" : step}
        </span>
        {label}
      </span>
    );
  };

  const bigCTAEnabled = selectedCase && hasAnyServiceSelected && grandTotal > 0;

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="relative w-full bg-white p-6 md:p-8 rounded-xl shadow-sm ring-1 ring-slate-100 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Additional Services Payment
          </h1>
        </div>
   
      </div>

      <div className="my-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Steps */}
        <div className="flex flex-wrap gap-2 mb-6">
          <StepChip step={1} label="Search Case" />
          <StepChip step={2} label="Select Clients" />
          <StepChip step={3} label="Add Services" />
          <StepChip step={4} label="Generate QR" />
        </div>
        <CountryOfDestination value={country} onChange={setCountry} />
      </div>

      <SearchUKTBCombobox
        setSelectedCase={setSelectedCase}
        setUkCases={setUkTBCases}
        ukFees={[]} // not needed here
      />

      <Separator className="my-6" />

      {selectedCase ? (
        <>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/60">
                <TableRow>
                  <TableHead className="w-[18%]">Client ID</TableHead>
                  <TableHead className="w-[22%]">Name</TableHead>
                  <TableHead className="w-[12%]">Age</TableHead>
                  <TableHead className="w-[32%]">Additional Services</TableHead>
                  <TableHead className="text-right w-[10%]">
                    Total (USD)
                  </TableHead>
                  <TableHead className="text-center w-[10%]">Remark</TableHead>
                  <TableHead className="text-center w-[10%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ukTBCases.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-sm text-muted-foreground"
                    >
                      No clients selected yet. Use the case selector above.
                    </TableCell>
                  </TableRow>
                )}

                {ukTBCases.map((client) => {
                  const age = CalculateAge(client.date_of_birth);
                  const services = addedServices[client.id] || [];
                  const total = getClientTotal(client.id);

                  return (
                    <React.Fragment key={client.id}>
                      <TableRow className="group transition hover:bg-slate-50/60">
                        <TableCell className="font-mono text-[11px] tracking-tight">
                          {client.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {client.First_Name} {client.Last_Name}
                        </TableCell>
                        <TableCell>{age}</TableCell>
                        <TableCell>
                          {services.length === 0 && (
                            <span className="text-xs italic text-slate-400">
                              No services
                            </span>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {services.map((svc) => (
                              <span
                                key={svc.instanceId}
                                className="group/chip inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-[11px] font-medium text-brand-700"
                              >
                                {svc.service_type_code.service_name}
                                <span className="text-brand-600/70 font-normal">
                                  ${parseFloat(svc.fee_amount_usd).toFixed(2)}
                                </span>
                                <button
                                  type="button"
                                  aria-label="Remove service"
                                  onClick={() =>
                                    removeService(client.id, svc.instanceId)
                                  }
                                  className="ml-0.5 rounded p-0.5 hover:bg-red-100 transition"
                                >
                                  <X className="h-3 w-3 text-red-500" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold font-mono">
                          ${total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-end gap-2">
                            <Input
                              placeholder="Remark"
                              className="h-8 w-40 text-xs bg-gray-50 border-gray-200"
                              value={remarks[client.id] || ""}
                              onChange={(e) =>
                                setRemarks((prev) => ({
                                  ...prev,
                                  [client.id]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => openAddServiceDialog(client.id)}
                            >
                              <Plus className="h-4 w-4" />
                              <span className="hidden sm:inline">Service</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => removeClient(client.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>

              {ukTBCases.length > 0 && hasAnyServiceSelected && (
                <TableCaption className="px-4 pb-4 text-right">
                  <div className="inline-flex flex-col items-end">
                    <span className="text-xs tracking-wide text-slate-500">
                      Total (USD)
                    </span>
                    <span className="text-xl font-bold">
                      ${grandTotal.toFixed(2)}
                    </span>
                    {exchangeRate && (
                      <span className="text-xs tracking-wide text-green-700 mt-1">
                        Total (NPR)
                        <span className="text-xl font-bold text-green-700 ml-2">
                          NPR{" "}
                          {grandTotalLocal?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </span>
                    )}
                  </div>
                </TableCaption>
              )}
            </Table>
          </div>

          {/* Dialog */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setActiveClientId(null);
                setServiceSelectId(null);
              }
              setIsDialogOpen(open);
            }}
          >
            <DialogContent className="sm:max-w-[460px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  Add Additional Service
                  {activeClientId && (
                    <span className="block mt-1 text-[11px] font-normal text-slate-500">
                      Client ID: {activeClientId}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-xs text-slate-500">
                  Only services not yet assigned to this client appear below.
                </div>
                <Select
                  value={serviceSelectId ? String(serviceSelectId) : undefined}
                  onValueChange={(val) => setServiceSelectId(Number(val))}
                  disabled={servicesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        servicesLoading ? "Loading..." : "Select a service"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50">
                    {servicesLoading ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        Loading services...
                      </div>
                    ) : availableServicesForClient.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No remaining services available.
                      </div>
                    ) : (
                      availableServicesForClient.map((svc) => (
                        <SelectItem key={svc.id} value={String(svc.id)}>
                          {svc.service_type_code.service_name} • $
                          {parseFloat(svc.fee_amount_usd).toFixed(2)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  onClick={confirmAddService}
                  disabled={
                    !serviceSelectId || !activeClientId || servicesLoading
                  }
                  className="min-w-[140px]"
                >
                  Add Service
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Separator className="my-10" />

          {/* Sticky Summary / CTA */}
          <div className="relative">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 justify-between bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex-1">
                <div className="flex flex-wrap gap-3 text-[11px] md:text-xs">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    Case: {selectedCase.id}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    Clients: {ukTBCases.length}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    Services:{" "}
                    {Object.values(addedServices).reduce(
                      (n, arr) => n + arr.length,
                      0
                    )}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    Total: ${grandTotal.toFixed(2)}
                  </span>
                  {exchangeRate && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 font-medium text-green-700">
                      Total NPR{" "}
                      {grandTotalLocal?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-md">
                  {hasAnyServiceSelected
                    ? "Review everything carefully. When ready, generate a QR code to complete payment."
                    : "Add at least one service for any client to enable the payment button."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 sm:gap-4 justify-between items-center flex-1">
                <Button
                  type="button"
                  onClick={handleCreatePayment}
                  disabled={!bigCTAEnabled || loading}
                  className={[
                    "group relative overflow-hidden sm:min-w-[230px] h-14 px-8 text-base font-semibold",
                    "bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500",
                    "enabled:hover:from-brand-500 enabled:hover:via-brand-500 enabled:hover:to-indigo-500",
                    "text-white shadow-lg shadow-brand-600/30",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  ].join(" ")}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Generating
                        QR...
                      </>
                    ) : (
                      <>
                        Generate QR & Pay
                        <QrCode className="h-5 w-5" />
                      </>
                    )}
                  </span>
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition
                               bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_60%)]"
                  />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={resetAll}
                  className="sm:min-w-[120px]"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50/40 p-10 text-center">
          <h2 className="font-medium text-slate-700 mb-2">
            Start by searching a case
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you select a case you will be able to choose clients and add
            billable additional services.
          </p>
        </div>
      )}
    </div>
  );
}
