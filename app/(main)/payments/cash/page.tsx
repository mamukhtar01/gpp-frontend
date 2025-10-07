import { CashPaymentPanelMimosa } from "@/components/payments/cash-payment-panel-mimosa";
import { getFeeStructures } from "@/app/server_actions/pricing";
import { QrCodePaymentPanel } from "@/components/payments/qrcode-payment-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { CashUKTBPaymentPanel } from "@/components/payments/cash-payment-UKTB-panel";

export default async function CashPaymentsPage() {
  const ukFees = await getFeeStructures({
    countryCode: 16,
    type: "medical_exam",
  });

  if (!ukFees) {
    throw new Error("Failed to fetch UK fee structures");
  }

  const additionalServicesList = await getFeeStructures({
    countryCode: 16,
    type: "special_service",
  });

  if (!additionalServicesList) {
    throw new Error("Failed to fetch additional services");
  }

  return (
    <div className="mx-auto">
      <h1 className="text-xl text-brand-300 font-bold">Cash Payments</h1>
      <hr className="mb-6 mt-2 text-brand-100" />
      <Tabs defaultValue="mimosa" className="min-w-6xl">
        <TabsList className="w-full flex justify-start gap-4 mb-6">
          <TabsTrigger value="mimosa">MiMOSA</TabsTrigger>
          <TabsTrigger value="uktb">UKTB</TabsTrigger>
          <TabsTrigger value="jims">JIMS</TabsTrigger>
          <div className=" ml-auto flex gap-4">
            <Link href="/payments/cash/vaccination-payment">
              <Button
                className="text-brand-500 hover:cursor-pointer"
                variant={"outline"}
              >
                Vaccination Payment
              </Button>
            </Link>
            <Link href="/payments/cash/additional-services">
              <Button
                className="text-brand-500 hover:cursor-pointer"
                variant={"outline"}
              >
                Additional Payment
              </Button>
            </Link>
          </div>
        </TabsList>
        <TabsContent value="mimosa">
          {/* MiMOSA Payment Case Search Panel */}
          <CashPaymentPanelMimosa />
        </TabsContent>
        <TabsContent value="uktb">
          <CashUKTBPaymentPanel
            ukFees={ukFees}
            additionalServicesList={additionalServicesList}
          />
        </TabsContent>
        <TabsContent value="jims">
          <QrCodePaymentPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
