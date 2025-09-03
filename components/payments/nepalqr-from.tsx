"use client"
import { Input } from "@/components/ui/input"
import { CaseSearchCombobox, TCase } from "./case-search-combobox"
import { Label } from "@radix-ui/react-label"
import { Separator } from "@radix-ui/react-separator"
import { useState } from "react"




export function NepalQrForm() {
  const [selectedCase, setSelectedCase] = useState<TCase | null>(null)

 

  return (
    <>
    <CaseSearchCombobox  setSelectedCase={setSelectedCase} />
    <Separator className="my-8" />
      {
        selectedCase && (
          <>
            <InputCol label="Case IDD" id="case_id" value={selectedCase.id} placeholder="Case ID" />
            <InputCol label="Main Client" id="client" value={selectedCase.main_client} placeholder="Main Client" />
            <InputCol label="Amount To Pay" id="amount" value={Number(selectedCase.package_price)} placeholder="Amount To Pay " />
            <InputCol label="Reference" id="reference" value={""}  isDisabled={false} placeholder="Reference" />
          </>
        )
      }
    </>
  )
}


function InputCol({ label, id, value, placeholder, isDisabled=true, ...props }: { label: string; value: string | number; id: string; placeholder: string; isDisabled?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
     <div className="grid grid-cols-2  w-full max-w-sm items-center my-6">
      <Label htmlFor={id}>{label}</Label>
      <Input type="text" id={id} disabled={isDisabled} placeholder={placeholder} value={value} {...props} />
    </div>
    </>
  )
}