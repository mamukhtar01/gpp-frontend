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
import { CaseMember, CaseMemberSummarySearch } from "./search-mimosa-combobox";
import { useExchangeRate } from "@/app/(main)/payments/exchangeRateContext";
import { TClientBasicInfo, TNewPaymentRecord } from "@/app/types";
import { createPayment } from "@/app/server_actions";
import { generateQRCodeNPR } from "@/lib/utils";

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

export function VaccinationServicesPaymentPanel({ additionalServices }: Props) {
  const router = useRouter();
  const [caseMembers, setCaseMembers] = useState<CaseMember[] | null>(null);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
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

  const getClientTotal = (member: CaseMember) => {
    return (addedServices[member.CaseMemberID] || []).reduce(
      (sum, svc) => sum + parseFloat(svc.fee_amount_usd),
      0
    );
  };

  // USD and NPR totals
  const grandTotalUSD = useMemo(
    () =>
      caseMembers
        ? caseMembers.reduce((sum, m) => sum + getClientTotal(m), 0)
        : 0,
    [caseMembers, addedServices]
  );
  const grandTotalNPR = useMemo(
    () => (exchangeRate ? grandTotalUSD * exchangeRate : 0),
    [grandTotalUSD, exchangeRate]
  );

  const bigCTAEnabled =
    caseMembers &&
    caseMembers.length > 0 &&
    grandTotalUSD > 0 &&
    !!exchangeRate &&
    grandTotalNPR > 0;

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
    setCaseMembers((prev) =>
      prev ? prev.filter((m) => m.CaseMemberID !== clientId) : prev
    );
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
    setCaseMembers(null);
    setAddedServices({});
    setRemarks({});
    setActiveClientId(null);
    setServiceSelectId(null);
  }

  async function handleCreatePayment() {
    if (!caseMembers || caseMembers.length === 0) return;
    setLoading(true);
    try {
      const totalAmountUSD = grandTotalUSD.toFixed(2);
      const totalAmountLocal = grandTotalNPR.toFixed(2);
      const caseNo = caseMembers[0].CaseNo;

      // Generate QR using NPR amount
      const { qrString, validationTraceId, timestamp } =
        await generateQRCodeNPR({
          nprAmount: totalAmountLocal,
          caseNo: caseNo ?? "N/A",
          purpose: "Bill payment",
        });

      const clientsInfo = caseMembers.map((m) => ({
        id: m.CaseMemberID.toString(),
        name: m.FullName,
        age: m.Age,
        amount: getClientTotal(m).toFixed(2),
        remark: remarks[m.CaseMemberID] || null,
        additional_services: (addedServices[m.CaseMemberID] || []).map((s) => ({
          id: s.id,
          fee_amount_usd: s.fee_amount_usd,
          service_code: s.service_type_code.service_code,
          service_name: s.service_type_code.service_name,
        })),
      }));

      const paymentRecord: TNewPaymentRecord = {
        case_number: caseNo,
        case_management_system: 1,
        mimosa_case: null,
        reference: null,
        amount_in_dollar: totalAmountUSD,
        amount_in_local_currency: totalAmountLocal,
        type_of_payment: 2,
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`,
        status: 1,
        validationTraceId: validationTraceId ?? "",
        payerInfo: caseMembers.map((m) => m.FullName).join(", "),
        qr_timestamp: timestamp ?? "",
        paidAmount: totalAmountLocal,
        qr_string: qrString,
        wave: null,
        clinic: null,
        clients: clientsInfo as TClientBasicInfo[],
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
    <div className="relative w-full bg-white p-6 md:p-8 rounded-xl shadow-sm ring-1 ring-slate-100 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Vaccination Payment <span className="font-light font-mono ml-10">(US)</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          <b>Instructions:</b> Search and select case members, add vaccination
          services, and generate a QR code for payment.
        </p>
      </div>

      <div className="mb-3 text-sm font-medium text-gray-700 flex items-center gap-2">
        {exchangeRate === null ? (
          <span className="text-red-500">
            Exchange rate (USD → NPR) unavailable.
          </span>
        ) : (
          <span>
            <span className="font-semibold">Exchange Rate:</span> 1 USD ={" "}
            <span className="font-bold">{exchangeRate}</span> NPR
          </span>
        )}
      </div>

      {/* --- Use CaseMemberSummarySearch for searching and selection --- */}
      <CaseMemberSummarySearch setSelectedSummary={setCaseMembers} />

      <Separator className="my-6" />

      {caseMembers && caseMembers.length > 0 ? (
        <>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/60">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Birth Date</TableHead>
                  <TableHead>Additional Services</TableHead>
                  <TableHead className="text-right">Total (USD)</TableHead>
                  <TableHead className="text-center">Remark</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseMembers.map((member) => {
                  const services = addedServices[member.CaseMemberID] || [];
                  const total = getClientTotal(member);
                  return (
                    <TableRow key={member.CaseMemberID}>
                      <TableCell className="font-mono text-[11px]">
                        {member.CaseMemberID}
                      </TableCell>
                      <TableCell>
                        {member.FullName} - {member?.RelationtoPA}
                      </TableCell>

                      <TableCell>{member.Gender}</TableCell>
                      <TableCell>{member.BirthDate?.slice(0, 10)}</TableCell>
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
                      <TableCell>
                        <Input
                          placeholder="Remark"
                          className="h-8 w-40 text-xs bg-gray-50 border-gray-200"
                          value={remarks[member.CaseMemberID] || ""}
                          onChange={(e) =>
                            setRemarks((prev) => ({
                              ...prev,
                              [member.CaseMemberID]: e.target.value,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => removeClient(member.CaseMemberID)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableCaption className="px-4 pb-4 text-right">
                <div className="inline-flex flex-col items-end">
                  <span className="text-xs tracking-wide text-slate-500">
                    Total (USD)
                  </span>
                  <span className="text-xl font-bold">
                    ${grandTotalUSD.toFixed(2)}
                  </span>
                  {exchangeRate && (
                    <>
                      <span className="text-xs tracking-wide text-green-700 mt-1">
                        Total (NPR)
                      </span>
                      <span className="text-xl font-bold text-green-700">
                        NPR{" "}
                        {grandTotalNPR.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </>
                  )}
                </div>
              </TableCaption>
            </Table>
          </div>

          {/* Service Add Dialog */}
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
            <DialogContent className="sm:max-w-[460px]">
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

          <Separator className="my-10" />

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-center bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-wrap gap-3 text-[11px] md:text-xs">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                Members: {caseMembers.length}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                Services:{" "}
                {Object.values(addedServices).reduce(
                  (n, arr) => n + arr.length,
                  0
                )}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                Total: ${grandTotalUSD.toFixed(2)}
              </span>
              {exchangeRate && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 font-medium text-green-700">
                  Total NPR{" "}
                  {grandTotalNPR.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                type="button"
                onClick={handleCreatePayment}
                disabled={!bigCTAEnabled || loading}
                className="sm:min-w-[230px] h-14 px-8 text-base font-semibold bg-brand-500 text-white shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating QR...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Generate QR & Pay
                    <QrCode className="h-5 w-5" />
                  </span>
                )}
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
