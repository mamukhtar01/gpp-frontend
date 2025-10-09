"use client";

import React, { useState, useMemo } from "react";
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
import {
  CaseMemberDetailsResponse,
  CaseMemberSummarySearch,
} from "./search-mimosa-combobox";
import { useExchangeRate } from "@/app/(main)/payments/exchangeRateContext";
import { TClientBasicInfo, TNewPaymentRecord } from "@/app/types";
import { createPayment } from "@/app/server_actions";
import { ExchangeRateWidget } from "../exchangeRateWidget";
import { getCountryIdFromCode } from "@/lib/utils";

/* --- Service addition types --- */
export interface AdditionalServiceFromDB {
  id: number;
  fee_amount_usd: string;
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

interface Props {
  additionalServices: AdditionalServiceFromDB[];
}

// InputCol (copied for remarks)
function InputCol({
  label,
  id,
  value,
  placeholder,
  isDisabled = true,
  onChange = () => {},
  ...props
}: {
  label: string;
  value: string | number;
  id: string;
  placeholder: string;
  isDisabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex gap-4 w-full max-w-sm my-6">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <Input
        type="text"
        id={id}
        disabled={isDisabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}

export function VaccinationServicesPaymentPanel({ additionalServices }: Props) {
  const router = useRouter();
  const [caseSearchResponse, setCaseSearchResponse] =
    useState<CaseMemberDetailsResponse | null>(null);
  const [reference, setReference] = useState<string>("");
  const [addedServices, setAddedServices] = useState<AddedServicesState>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [serviceSelectId, setServiceSelectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const exchangeRate = useExchangeRate();

  const availableServicesForClient = useMemo(() => {
    if (!activeClientId) return additionalServices;
    const used = new Set(
      (addedServices[activeClientId] || []).map((s) => s.id)
    );
    return additionalServices.filter((s) => !used.has(s.id));
  }, [activeClientId, addedServices, additionalServices]);

  const getClientTotal = (memberId: number) => {
    return (addedServices[memberId] || []).reduce(
      (sum, svc) => sum + parseFloat(svc.fee_amount_usd),
      0
    );
  };

  // USD and NPR totals
  const grandTotalUSD = useMemo(
    () =>
      caseSearchResponse?.members
        ? caseSearchResponse.members.reduce(
            (sum, m) => sum + getClientTotal(m.CaseMemberID),
            0
          )
        : 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caseSearchResponse?.members, addedServices]
  );
  const grandTotalNPR = useMemo(
    () => (exchangeRate ? grandTotalUSD * exchangeRate : 0),
    [grandTotalUSD, exchangeRate]
  );



  function openAddServiceDialog(clientId: number) {
    setActiveClientId(clientId.toString());
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

  function removeService(clientId: number, instanceId: string) {
    setAddedServices((prev) => ({
      ...prev,
      [clientId]: prev[clientId].filter((s) => s.instanceId !== instanceId),
    }));
  }

  function removeClient(clientId: number) {
    setCaseSearchResponse((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.filter((m) => m.CaseMemberID !== clientId),
          }
        : prev
    );
    setAddedServices((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [clientId]: _, ...rest } = prev;
      return rest;
    });
  }

  function resetAll() {
    setCaseSearchResponse(null);
    setAddedServices({});
    setReference("");
    setActiveClientId(null);
    setServiceSelectId(null);
  }

  async function handleCreatePayment() {
    if (!caseSearchResponse?.members || caseSearchResponse.members.length === 0)
      return;
    setLoading(true);
    try {
      const totalAmountUSD = grandTotalUSD.toFixed(2);
      const totalAmountLocal = grandTotalNPR.toFixed(2);
      const caseNo = caseSearchResponse.members[0].CaseNo;

      // Generate QR using NPR amount
      const res = await fetch("/api/nepalpay/generateQR", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionCurrency: "524",
          transactionAmount: grandTotalNPR,
          billNumber: caseNo,
          referenceLabel: reference,
          storeLabel: "Store1",
          terminalLabel: "Terminal1",
          purposeOfTransaction: "Bill payment",
        }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(JSON.stringify(json));
      if (!json?.data?.qrString || !json?.data?.validationTraceId) {
        throw new Error("Invalid response from QR generation API");
      }

      const qrString = json.data?.qrString;
      const validationTraceId = json.data?.validationTraceId;
      const timestamp = json?.timestamp;

      const clientsInfo: TClientBasicInfo[] = caseSearchResponse.members.map((m) => ({
        id: String(m.CaseMemberID),
        name: m.FullName,
        age: m.Age,
        amount: getClientTotal(m.CaseMemberID).toFixed(2).toString(),
        additional_services: (addedServices[m.CaseMemberID] || []).map((s) => ({
          id: String(s.id),
          fee_amount_usd: s.fee_amount_usd,
          service_code: s.service_type_code.service_code,
          service_name: s.service_type_code.service_name,
        })) || null,
      }));

      const paymentRecord: TNewPaymentRecord = {
        case_number: caseNo,
        mimosa_case: null,
        case_management_system: 1,
        reference: reference || null,
        amount_in_dollar: totalAmountUSD,
        amount_in_local_currency: totalAmountLocal,
        type_of_payment: 2,
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`,
        status: 1,
        validationTraceId: validationTraceId ?? "",
        payerInfo: caseSearchResponse.members.map((m) => m.FullName).join(", "),
        qr_timestamp: timestamp ?? "",
        paidAmount: totalAmountLocal,
        qr_string: qrString,
        wave: null,
        clinic: null,
        destination_country:
          getCountryIdFromCode(caseSearchResponse?.DestinationCountry) || null,
        exchange_rate: exchangeRate,
        clients: clientsInfo,
        service_type: "vaccination",
      };

      // Create payment record in the database
      const paymentRes = await createPayment(paymentRecord);

      router.push(`/payments/qrcode/${caseNo}?paymentId=${paymentRes.id}`);
    } catch (e: unknown) {
      alert(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 bg-white rounded shadow w-full max-w-6xl min-h-[470px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <ExchangeRateWidget exchangeRate={exchangeRate} />
        {/* Country details */}
        {caseSearchResponse?.DestinationCountry && caseSearchResponse?.OriginCountry && (
          <div className="text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center gap-4">
            <p>
              Destination:{" "}
              <span className="font-bold">
                {caseSearchResponse?.DestinationCountry}
              </span>
            </p>
            <p>
              Origin:{" "}
              <span className="font-bold">
                {caseSearchResponse?.OriginCountry}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* --- Use CaseMemberSummarySearch for searching and selection --- */}
      <CaseMemberSummarySearch setSelectedSummary={setCaseSearchResponse} />

      <Separator className="my-8" />

      {caseSearchResponse?.members && caseSearchResponse.members.length > 0 ? (
        <>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/60">
                <TableRow>
                  <TableHead className="w-[8%]">ID</TableHead>
                  <TableHead className="w-[18%]">Name</TableHead>
                  <TableHead className="w-[12%]">Relation</TableHead>
                  <TableHead className="w-[8%]">Gender</TableHead>
                  <TableHead className="w-[14%]">Birth Date</TableHead>
                  <TableHead className="w-[8%]">Age</TableHead>
                  <TableHead className="w-[14%]">Additional Services</TableHead>
                  <TableHead className="w-[8%] text-right">
                    Amount (USD)
                  </TableHead>
                  <TableHead className="w-[10%] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseSearchResponse.members.map((member) => {
                  const services = addedServices[member.CaseMemberID] || [];
                  const total = getClientTotal(member.CaseMemberID);
                  return (
                    <TableRow key={member.CaseMemberID}>
                      <TableCell className="font-mono text-[11px]">
                        {member.CaseMemberID}
                      </TableCell>
                      <TableCell>{member.FullName}</TableCell>
                      <TableCell>{member.RelationtoPA}</TableCell>
                      <TableCell>{member.Gender}</TableCell>
                      <TableCell>{member.BirthDate?.slice(0, 10)}</TableCell>
                      <TableCell>{member.Age}</TableCell>
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
                              className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-[11px] font-medium text-brand-700"
                            >
                              {svc.service_type_code.service_name}
                              <span className="text-brand-600/70 font-normal">
                                ${parseFloat(svc.fee_amount_usd).toFixed(2)}
                              </span>
                              <button
                                type="button"
                                aria-label="Remove service"
                                onClick={() =>
                                  removeService(
                                    member.CaseMemberID,
                                    svc.instanceId
                                  )
                                }
                                className="ml-0.5 rounded p-0.5 hover:bg-red-100"
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 mt-2"
                          onClick={() =>
                            openAddServiceDialog(member.CaseMemberID)
                          }
                        >
                          <Plus className="h-4 w-4" />
                          <span className="hidden sm:inline">Add Service</span>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right font-semibold font-mono">
                        ${total.toFixed(2)}
                      </TableCell>
                      <TableCell className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 "
                          onClick={() => removeClient(member.CaseMemberID)}
                          title="Remove client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableCaption className="mt-8 font-bold text-right">
                Total Amount to Pay:
                <span className="ml-2 text-blue-700">
                  USD ${grandTotalUSD.toFixed(2)}
                </span>
                {exchangeRate && (
                  <span className="ml-2 text-green-700">
                    | NPR{" "}
                    {grandTotalNPR?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                )}
              </TableCaption>
            </Table>
          </div>
          <Separator className="my-8" />
          <InputCol
            label="Remarks: "
            id="remarks"
            value={reference}
            isDisabled={false}
            placeholder="Remarks"
            className="w-full"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setReference(e.target.value)
            }
          />
          <Separator className="my-16" />
          <div className="flex gap-6 mt-2 justify-between">
            <button
              onClick={handleCreatePayment}
              disabled={loading || grandTotalUSD <= 0 || !exchangeRate}
              className="flex items-center justify-center h-12 w-[220px] rounded-md bg-brand-500 text-white font-bold text-base shadow-sm hover:bg-brand-600 hover:cursor-pointer transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  GENERATE NEPAL QR
                  <QrCode className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
            <button
              onClick={resetAll}
              className="flex items-center justify-center h-12 w-[140px] rounded-md border border-brand-700 text-brand-500 font-bold text-base bg-white hover:cursor-pointer hover:bg-blue-50 transition"
            >
              RESET FIELD
            </button>
          </div>
          {/* Add Service Dialog */}
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
                <Select
                  value={serviceSelectId ? String(serviceSelectId) : undefined}
                  onValueChange={(val) => setServiceSelectId(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {availableServicesForClient.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No remaining services available.
                      </div>
                    )}
                    {availableServicesForClient.map((svc) => (
                      <SelectItem key={svc.id} value={String(svc.id)}>
                        {svc.service_type_code.service_name} • $
                        {parseFloat(svc.fee_amount_usd).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  onClick={confirmAddService}
                  disabled={!serviceSelectId || !activeClientId}
                  className="min-w-[140px]"
                >
                  Add Service
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50/40 p-10 text-center">
          <h2 className="font-medium text-slate-700 mb-2">
            Start by searching and selecting case members
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you select members you will be able to add vaccination services
            and generate a payment QR code.
          </p>
        </div>
      )}
    </div>
  );
}