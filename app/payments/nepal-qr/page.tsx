import { CaseSearchPanel } from "@/components/payments/case-search-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function PaymentsPage() {


  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="mimosa" className="min-w-[800px]">
        <TabsList className="w-full justify-center mb-4">
          <TabsTrigger value="mimosa">MiMOSA</TabsTrigger>
          <TabsTrigger value="uktb">UKTB</TabsTrigger>
        </TabsList>
        <TabsContent value="mimosa">
          <CaseSearchPanel />
        </TabsContent>
        <TabsContent value="uktb">
          Not implemented yet
        </TabsContent>
      </Tabs>
     
    </div>
  );
}
