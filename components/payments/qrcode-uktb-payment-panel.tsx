"use client";

import { useState, useMemo } from "react";
import { Separator } from "@radix-ui/react-separator";
import { createPayment } from "@/app/server_actions";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { QrCode, Trash2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { TUKTB_Cases } from "@/lib/schema";
import { SearchUKTBCombobox } from "./search-uktbcase-combobox";
import { FeeStructure, TClientBasicInfo, TNewPaymentRecord } from "@/app/types";
import { CalculateAge, getFeeByAge } from "@/lib/utils";
import React from "react";
import { useExchangeRate } from "@/app/(main)/payments/exchangeRateContext";
import { ExchangeRateWidget } from "../exchangeRateWidget";
import Link from "next/link";

/* ---------------- Types ---------------- */

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

interface QrCodeUKTBPaymentPanelProps {
  ukFees: FeeStructure[];
  additionalServicesList: AdditionalServiceFromDB[];
}

export function QrCodeUKTBPaymentPanel({
  ukFees,
  additionalServicesList,
}: QrCodeUKTBPaymentPanelProps) {
  const router = useRouter();
  const [selectedCase, setSelectedCase] = useState<TUKTB_Cases | null>(null);
  const [ukTBCases, setUkCases] = useState<TUKTB_Cases[]>([]);
  const [loading, setLoading] = useState(false);

  const [addedServices, setAddedServices] = useState<AddedServicesState>({});
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  // Exchange Rate Context (local currency per 1 USD)
  const exchangeRate = useExchangeRate(); // e.g. 133.5

  /* ---------------- Helpers ---------------- */

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
    () => ukTBCases.reduce((sum, c) => sum + getClientTotal(c), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ukTBCases, addedServices]
  );

  const grandTotalLocal = useMemo(() => {
    if (!exchangeRate) return null;
    return grandTotalUSD * exchangeRate;
  }, [grandTotalUSD, exchangeRate]);

  const availableServicesForActiveClient = useMemo(() => {
    if (!activeClientId) return additionalServicesList;
    const taken = new Set(
      (addedServices[activeClientId] || []).map((s) => s.id)
    );
    return additionalServicesList.filter((s) => !taken.has(s.id));
  }, [activeClientId, addedServices, additionalServicesList]);

  /* ---------------- Service Management ---------------- */

  const handleAddService = () => {
    if (!activeClientId || !selectedServiceId) return;
    const svc = additionalServicesList.find((s) => s.id === selectedServiceId);
    if (!svc) return;

    setAddedServices((prev) => ({
      ...prev,
      [activeClientId]: [
        ...(prev[activeClientId] || []),
        { ...svc, instanceId: `svc-${Date.now()}-${Math.random()}` },
      ],
    }));

    setSelectedServiceId(null);
    setActiveClientId(null);
    setIsServiceDialogOpen(false);
  };

  const removeService = (clientId: string, instanceId: string) => {
    setAddedServices((prev) => ({
      ...prev,
      [clientId]: prev[clientId].filter((s) => s.instanceId !== instanceId),
    }));
  };

  const removeClient = (clientId: string) => {
    setUkCases((prev) => prev.filter((c) => c.id !== clientId));
    setAddedServices((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [clientId]: _, ...rest } = prev;
      return rest;
    });
  };

  /* ---------------- Payment Submission ---------------- */

  async function handleQRGenerateAndCreatePayment() {
    if (!selectedCase) return;
    setLoading(true);
    try {
      const totalAmountToPayDollars = grandTotalUSD.toFixed(2);
      const totalAmountToPayLocalCurrency = grandTotalLocal
        ? grandTotalLocal.toFixed(2)
        : totalAmountToPayDollars;

      const res = await fetch("/api/nepalpay/generateQR", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionCurrency: "524",
          transactionAmount: Number(totalAmountToPayLocalCurrency),
          billNumber: selectedCase.id ?? "N/A",
          storeLabel: "Store1",
          terminalLabel: "Terminal1",
          purposeOfTransaction: "Bill payment",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.data?.qrString || !json?.data?.validationTraceId) {
        throw new Error("Failed to generate QR code");
      }

      const { qrString, validationTraceId, timestamp } = json.data;

      const clientsInfo: TClientBasicInfo[] = ukTBCases.map((client) => ({
        id: client.id,
        name: `${client.First_Name} ${client.Last_Name}`,
        age: CalculateAge(client.date_of_birth) ?? 0,
        amount: getClientTotal(client).toFixed(2).toString(),
        additional_services: (addedServices[client.id] || []).map((s) => ({
          id: s.id.toString(),
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
        amount_in_dollar: totalAmountToPayDollars,
        amount_in_local_currency: totalAmountToPayLocalCurrency,
        type_of_payment: 2,
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`,
        status: 1,
        validationTraceId: validationTraceId ?? "",
        payerInfo: `${selectedCase.First_Name || ""} ${
          selectedCase.Last_Name || ""
        }`.trim(),
        qr_timestamp: timestamp ?? "",
        paidAmount: totalAmountToPayLocalCurrency,
        qr_string: qrString,
        wave: null,
        clinic: null,
        clients: clientsInfo,
      };

      const paymentRes = await createPayment(paymentRecord);
      if (!paymentRes) throw new Error("Failed to create payment record");

      router.push(`/payments/qrcode/${selectedCase.id}?paymentId=${paymentRes.id}`);
    } catch (e: unknown) {
      alert(`Failed to generate QR: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- Render ---------------- */

  return (
    <div className="p-8 rounded shadow w-full max-w-6xl min-h-[470px] flex flex-col bg-white">
      <ExchangeRateWidget exchangeRate={exchangeRate} className="mb-4" />
      <SearchUKTBCombobox
        setSelectedCase={setSelectedCase}
        setUkCases={setUkCases}
        ukFees={ukFees}
      />
      <Separator className="my-8" />
      {selectedCase && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead className="text-right">Amount (USD)</TableHead>
                <TableHead className="text-center">Remark</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ukTBCases.map((client) => {
                const age = CalculateAge(client.date_of_birth);
                const clientTotal = getClientTotal(client);

                return (
                  <React.Fragment key={client.id}>
                    <TableRow>
                      <TableCell className="font-medium">{client.id}</TableCell>
                      <TableCell>
                        {client.First_Name} {client.Last_Name}
                      </TableCell>
                      <TableCell>{age}</TableCell>
                      <TableCell className="text-right">
                        ${clientTotal.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Input
                            className="h-8 w-40 text-center flex-2 border-gray-200"
                            id={`remark-${client.id}`}
                            type="text"
                            placeholder="add remark"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="flex justify-around">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setActiveClientId(client.id);
                            setIsServiceDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="hidden sm:inline">Additional Service</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 "
                          onClick={() => removeClient(client.id)}
                          title="Remove client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {(addedServices[client.id]?.length ?? 0) > 0 && (
                      <TableRow key={`services-${client.id}`}>
                        <TableCell colSpan={6} className="pt-2 pb-3">
                          <div className="flex flex-wrap gap-2 pl-2">
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                              Services:
                            </span>
                            {addedServices[client.id]?.map((svc) => (
                              <span
                                key={svc.instanceId}
                                className="group inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700"
                              >
                                {svc.service_type_code.service_name} • $
                                {parseFloat(svc.fee_amount_usd).toFixed(2)}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeService(client.id, svc.instanceId)
                                  }
                                  className="ml-1 rounded p-0.5 hover:bg-red-100"
                                  aria-label="Remove service"
                                >
                                  <X className="h-3 w-3 text-red-500" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
            {ukTBCases.length > 0 && (
              <TableCaption className="mt-8 font-bold text-right">
                Total Amount to Pay:
                <span className="ml-2 text-blue-700">
                  USD ${grandTotalUSD.toFixed(2)}
                </span>
                {exchangeRate && (
                  <span className="ml-2 text-green-700">
                    | NPR {grandTotalLocal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                )}
              </TableCaption>
            )}
          </Table>

          <Dialog
            open={isServiceDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setActiveClientId(null);
                setSelectedServiceId(null);
              }
              setIsServiceDialogOpen(open);
            }}
          >
            <DialogContent className="sm:max-w-[420px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-base">
                  Add Additional Service
                  {activeClientId && (
                    <span className="block mt-1 text-xs font-normal text-muted-foreground">
                      For Client ID: {activeClientId}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Select
                  value={
                    selectedServiceId ? String(selectedServiceId) : undefined
                  }
                  onValueChange={(val) => setSelectedServiceId(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {availableServicesForActiveClient.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No services available to add.
                      </div>
                    )}
                    {availableServicesForActiveClient.map((svc) => (
                      <SelectItem key={svc.id} value={String(svc.id)}>
                        {svc.service_type_code.service_name} ($
                        {parseFloat(svc.fee_amount_usd).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddService}
                  disabled={!selectedServiceId || !activeClientId}
                >
                  Add Service
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Separator className="my-16" />
          <div className="flex gap-6 mt-2 justify-between">
            <button
              onClick={handleQRGenerateAndCreatePayment}
              disabled={loading || grandTotalUSD <= 0 || !exchangeRate}
              className="flex items-center justify-center h-12 w-[240px] rounded-md bg-brand-500 text-white font-bold text-base shadow-sm hover:bg-brand-600 hover:cursor-pointer transition disabled:opacity-60"
            >
              {loading ? "GENERATING..." : "GENERATE NEPAL QR"}
              <QrCode className="ml-2 w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setSelectedCase(null);
                setUkCases([]);
                setAddedServices({});
                setActiveClientId(null);
                setSelectedServiceId(null);
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