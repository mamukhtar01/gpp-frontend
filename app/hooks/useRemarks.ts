import { useState } from "react";

export function useRemarks(initial: Record<string, string> = {}) {
  const [remarks, setRemarks] = useState<Record<string, string>>(initial);

  const setRemark = (clientId: string, value: string) =>
    setRemarks((prev) => ({ ...prev, [clientId]: value }));

  const removeRemark = (clientId: string) => {
    setRemarks((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [clientId]: _, ...rest } = prev;
      return rest;
    });
  };

  const resetRemarks = () => setRemarks({});
  return { remarks, setRemark, removeRemark, resetRemarks };
}