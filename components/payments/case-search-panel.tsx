"use client";
import { Input } from "@/components/ui/input";
import { CaseSearchCombobox, TCase } from "./case-search-combobox";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCaseContext } from "@/app/payments/nepal-qr/caseContext";

import { QrCode } from "lucide-react";
import { createPayment } from "@/app/server_actions";

export function CaseSearchPanel() {
  const [selectedCase, setSelectedCase] = useState<TCase | null>(null);
  const [reference, setReference] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setCaseData, setQrData } = useCaseContext();

  async function handleGenerate() {
    setLoading(true);
    try {
      // fetch directly here since we are in a client component
      const res = await fetch("/api/payments/nepalqr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionCurrency: "524",
          transactionAmount: Number(selectedCase?.package_price ?? 0),
          billNumber: reference,
          storeLabel: "Store1",
          terminalLabel: "Terminal1",
          purposeOfTransaction: "Bill payment",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(json));

      // Example: route.ts returns the upstream response object. many providers nest in data
      const payload = json.data ?? json;

      const qrString =
        payload.qrString ??
        payload.data?.qrString ??
        payload.qrStringBase64 ??
        "";
      const validationTraceId =
        payload.validationTraceId ?? payload.data?.validationTraceId;

      // create payment record.

      const paymentRecord = {
        case_id: selectedCase?.id ?? "",
        amount_in_dollar: (
          Number(selectedCase?.package_price ?? 0) / 132
        ).toFixed(2), // example conversion
        amount_in_local_currency: selectedCase?.package_price ?? "0",
        type_of_payment: 1, // assuming 1 represents Nepal QR
        date_of_payment: new Date().toISOString(),
        transaction_id: `TXN-${Date.now()}`, // example transaction ID
        status: 2, // assuming 2 represents success
        validationTraceId: validationTraceId ?? "",
        payerInfo: selectedCase?.main_client ?? "",
        qr_timestamp: new Date().toISOString(),
        paidAmount: selectedCase?.package_price ?? "0",
        qr_string: qrString,
      };
      const paymentRes = await createPayment(paymentRecord);

      if (!paymentRes) {
        throw new Error("Failed to create payment record");
      }

      console.log("Payment record created:", paymentRes);
      // make sure we set the qrString in expected shape
      setCaseData(selectedCase);
      setQrData({
        qrString: qrString,
        validationTraceId: validationTraceId,
      });

      // make sure we set the qrString in expected shape
      setCaseData(selectedCase);
      setQrData({
        qrString,
        validationTraceId,
      });

      router.push(`/payments/nepal-qr/${selectedCase?.id}`);
    } catch (e: unknown) {
      alert("Failed to generate QR: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <CaseSearchCombobox setSelectedCase={setSelectedCase} />
      <Separator className="my-8" />
      {selectedCase && (
        <>
          <InputCol
            label="Case ID"
            id="case_id"
            value={selectedCase.id ?? ""}
            placeholder="Case ID"
          />
          <InputCol
            label="Main Client"
            id="client"
            value={selectedCase.main_client ?? ""}
            placeholder="Main Client"
          />
          <InputCol
            label="Amount To Pay"
            id="amount"
            value={Number(selectedCase.package_price)}
            placeholder="Amount To Pay "
          />
          <InputCol
            label="Reference"
            id="reference"
            value={reference}
            isDisabled={false}
            placeholder="Reference"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setReference(e.target.value)
            }
          />
          <Separator className="my-16" />
          <div className="flex justify-between">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 flex justify-center  py-4 rounded border border-gray-700 text-gray-700 hover:bg-gray-200 hover:cursor-pointer hover:font-semibold"
            >
              {loading ? "Generating..." : "Generate Nepal QR"}
              <QrCode className="ml-2" />
            </button>

            <button
              onClick={() => {
                setSelectedCase(null);
                setReference("");
              }}
              className="px-4 flex justify-center  py-4 rounded border border-red-700 text-red-700 hover:bg-gray-200 hover:cursor-pointer hover:font-semibold"
            >
              Reset Fields
            </button>
          </div>
        </>
      )}
    </>
  );
}

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
    <>
      <div className="grid grid-cols-2  w-full max-w-sm items-center my-6">
        <Label htmlFor={id}>{label}</Label>
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
    </>
  );
}
