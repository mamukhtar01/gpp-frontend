"use client";
import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, X } from "lucide-react";
import { TUKTB_Cases } from "@/lib/schema";


interface PaymentClientsTableProps {
  clients: TUKTB_Cases[];
  getClientTotal: (client: TUKTB_Cases) => number;
  remarks?: Record<string, string>;
  onRemarkChange?: (clientId: string, value: string) => void;
  onRemoveClient: (clientId: string) => void;
  onAddServiceClick?: (clientId: string) => void;
  addedServices?: Record<string, { id: number; service_type_code: { service_name: string }; fee_amount_usd: string }[]>;
  removeService?: (clientId: string, id: number) => void;
  grandTotalUSD: number;
  grandTotalLocal?: number | null;
  exchangeRate?: number;
}

export const PaymentClientsTable: React.FC<PaymentClientsTableProps> = ({
  clients,
  getClientTotal,
  remarks = {},
  onRemarkChange,
  onRemoveClient,
  onAddServiceClick,
  addedServices = {},
  removeService,
  grandTotalUSD,
  grandTotalLocal,
  exchangeRate,
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Age</TableHead>
        <TableHead className="text-right">Amount (USD)</TableHead>
        <TableHead className="text-center">Remark</TableHead>
        <TableHead className="text-center">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {clients.map((client) => {
        const age = client.date_of_birth ? (new Date().getFullYear() - new Date(client.date_of_birth).getFullYear()) : 0;
        const clientTotal = getClientTotal(client);

        return (
          <React.Fragment key={client.id}>
            <TableRow>
              <TableCell className="font-medium">{client.id}</TableCell>
              <TableCell>{client.First_Name} {client.Last_Name}</TableCell>
              <TableCell>{age}</TableCell>
              <TableCell className="text-right">
                ${clientTotal.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <Input
                  className="h-8 w-40 text-center flex-2 border-gray-200"
                  id={`remark-${client.id}`}
                  type="text"
                  placeholder="add remark"
                  value={remarks[client.id] || ""}
                  onChange={onRemarkChange ? (e) => onRemarkChange(client.id, e.target.value) : undefined}
                />
              </TableCell>
              <TableCell className="flex justify-around">
                {onAddServiceClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => onAddServiceClick(client.id)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Additional Service</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 "
                  onClick={() => onRemoveClient(client.id)}
                  title="Remove client"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            {(addedServices[client.id]?.length ?? 0) > 0 && (
              <TableRow key={`services-${client.id}`}>
                <TableCell colSpan={6} className="pt-2 pb-3">
                  <div className="flex flex-wrap gap-2 pl-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                      Services:
                    </span>
                    {addedServices[client.id]?.map((svc) => (
                      <span
                        key={svc.id}
                        className="group inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700"
                      >
                        {svc.service_type_code.service_name} • $
                        {parseFloat(svc.fee_amount_usd).toFixed(2)}
                        {removeService && (
                          <button
                            type="button"
                            onClick={() => removeService(client.id, svc.id)}
                            className="ml-1 rounded p-0.5 hover:bg-red-100"
                            aria-label="Remove service"
                          >
                            <X className="h-3 w-3 text-red-500" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        );
      })}
    </TableBody>
    {clients.length > 0 && (
      <TableCaption className="mt-8 font-bold text-right">
        Total Amount to Pay:
        <span className="ml-2 text-blue-700">
          USD ${grandTotalUSD.toFixed(2)}
        </span>
        {exchangeRate && (
          <span className="ml-2 text-green-700">
            | NPR {grandTotalLocal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        )}
      </TableCaption>
    )}
  </Table>
);