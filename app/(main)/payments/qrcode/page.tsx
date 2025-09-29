import { getFeeStructures } from "@/app/server_actions/pricing";
import { QrCodePaymentPanel } from "@/components/payments/qrcode-payment-panel";
import { QrCodeUKTBPaymentPanel } from "@/components/payments/qrcode-uktb-payment-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";


export default async function PaymentsPage() {
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
      <Tabs defaultValue="mimosa" className="min-w-6xl">
        <TabsList className="w-full flex justify-start gap-4 mb-6">
          <TabsTrigger value="mimosa">MiMOSA</TabsTrigger>
          <TabsTrigger value="uktb">UKTB</TabsTrigger>
          <TabsTrigger value="jims">JIMS</TabsTrigger>
          <Link href="/payments/qrcode/additional-services" className=" ml-auto ">
            <Button className="text-brand-500 hover:cursor-pointer" variant={"outline"}>
              Create Additional Services
            </Button>
          </Link>
        </TabsList>
        <TabsContent value="mimosa">
          {/* MiMOSA Payment Case Search Panel */}
          <QrCodePaymentPanel />
        </TabsContent>
        <TabsContent value="uktb">
          <QrCodeUKTBPaymentPanel
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
