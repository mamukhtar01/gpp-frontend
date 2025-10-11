
import { AdditionalServiceFromDB } from "@/components/payments/cash-payment-UKTB-panel";
import { useState, useMemo } from "react";


export function useAdditionalServices(
  clients: { id: string }[],
  additionalServicesList: AdditionalServiceFromDB[]
) {
  const [addedServices, setAddedServices] = useState<Record<string, AdditionalServiceFromDB[]>>({});
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);

  const availableServicesForActiveClient = useMemo(() => {
    if (!activeClientId) return additionalServicesList;
    const taken = new Set(
      (addedServices[activeClientId] || []).map((s) => s.id)
    );
    return additionalServicesList.filter((s) => !taken.has(s.id));
  }, [activeClientId, addedServices, additionalServicesList]);

  const handleAddService = () => {
    if (!activeClientId || !selectedServiceId) return;
    const svc = additionalServicesList.find((s) => s.id === selectedServiceId);
    if (!svc) return;

    setAddedServices((prev) => ({
      ...prev,
      [activeClientId]: [
        ...(prev[activeClientId] || []),
        { ...svc, instanceId: `svc-${Date.now()}-${Math.random()}` },
      ],
    }));

    setSelectedServiceId(null);
    setActiveClientId(null);
    setIsServiceDialogOpen(false);
  };

  const removeService = (clientId: string, id: number) => {
    setAddedServices((prev) => ({
      ...prev,
      [clientId]: prev[clientId].filter((s) => s.id !== id),
    }));
  };

  return {
    addedServices,
    setAddedServices,
    activeClientId,
    setActiveClientId,
    selectedServiceId,
    setSelectedServiceId,
    isServiceDialogOpen,
    setIsServiceDialogOpen,
    availableServicesForActiveClient,
    handleAddService,
    removeService,
  };
}