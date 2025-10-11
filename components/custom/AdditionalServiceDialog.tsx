"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AdditionalServiceFromDB } from "../payments/cash-payment-UKTB-panel";

export const AdditionalServiceDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeClientId: string | null;
  selectedServiceId: number | null;
  setSelectedServiceId: (id: number | null) => void;
  availableServices: AdditionalServiceFromDB[];
  handleAddService: () => void;
}> = ({
  open,
  onOpenChange,
  activeClientId,
  selectedServiceId,
  setSelectedServiceId,
  availableServices,
  handleAddService,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      aria-describedby="additional-service-dialog-desc"
    >
      <DialogContent className="sm:max-w-[420px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-base">
            Add Additional Service
            {activeClientId && (
              <span className="block mt-1 text-xs font-normal text-muted-foreground">
                For Client ID: {activeClientId}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Select an additional service to add for the selected client.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Select
            value={selectedServiceId ? String(selectedServiceId) : ""}
            onValueChange={(val) => setSelectedServiceId(Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {availableServices.length === 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  No services available to add.
                </div>
              )}
              {availableServices.map((svc) => (
                <SelectItem key={svc.id} value={String(svc.id)}>
                  {svc.service_type_code.service_name} ($
                  {parseFloat(svc.fee_amount_usd).toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddService}
            disabled={!selectedServiceId || !activeClientId}
          >
            Add Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
