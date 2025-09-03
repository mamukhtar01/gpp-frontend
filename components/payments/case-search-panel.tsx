"use client";
import { Input } from "@/components/ui/input";
import { CaseSearchCombobox, TCase } from "./case-search-combobox";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCaseContext } from "@/app/payments/nepal-qr/caseContext";

import { QrCode } from "lucide-react";

export function CaseSearchPanel() {
  const [selectedCase, setSelectedCase] = useState<TCase | null>(null);
  const [reference, setReference] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setCaseData, setQrData } = useCaseContext();

  async function handleGenerate() {
    setLoading(true);
    try {
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
      const payload = (json.data ?? json);
      // make sure we set the qrString in expected shape
      setCaseData(selectedCase);
      setQrData({
        qrString: payload.qrString ?? payload.data?.qrString ?? payload.qrStringBase64 ?? "",
        validationTraceId: payload.validationTraceId ?? payload.data?.validationTraceId,
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
