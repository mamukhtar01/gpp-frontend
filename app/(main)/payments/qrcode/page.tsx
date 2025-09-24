import { getUKFeeStructures } from "@/app/server_actions/pricing";
import { QrCodePaymentPanel } from "@/components/payments/qrcode-payment-panel";
import { QrCodeUKTBPaymentPanel } from "@/components/payments/qrcode-uktb-payment-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function PaymentsPage() {


   const ukFees = await getUKFeeStructures();

  if (!ukFees) {
    throw new Error("Failed to fetch UK fee structures");
  }



  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="mimosa" className="min-w-[800px]">
        <TabsList className="w-full flex justify-start gap-4 mb-6">
          <TabsTrigger value="mimosa">MiMOSA</TabsTrigger>
          <TabsTrigger value="uktb">UKTB</TabsTrigger>
          <TabsTrigger value="jims">JIMS</TabsTrigger>
        </TabsList>
        <TabsContent value="mimosa">
          {/* MiMOSA Payment Case Search Panel */}
          <QrCodePaymentPanel />
        </TabsContent>
        <TabsContent value="uktb">
        <QrCodeUKTBPaymentPanel ukFees={ukFees} />
        </TabsContent>
        <TabsContent value="jims">
        <QrCodePaymentPanel />
        </TabsContent>
      </Tabs>
     
    </div>
  );
}
