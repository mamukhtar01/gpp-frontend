"use client";

import { NepalQrForm } from "@/components/nepalqr-from";
import NepalQRPanel from "@/components/payments/NepalQrCodePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PaymentsPage() {
  return (
    <div className="">
      <Tabs defaultValue="mimosa" className="min-w-[800px]">
        <TabsList className="w-full justify-center mb-4">
          <TabsTrigger value="mimosa">MiMOSA</TabsTrigger>
          <TabsTrigger value="uktb">UKTB</TabsTrigger>
        </TabsList>
        <TabsContent value="mimosa">
          <NepalQrForm />
        </TabsContent>
        <TabsContent value="uktb">
          Not implemented yet
        </TabsContent>
      </Tabs>
     
    </div>
  );
}
