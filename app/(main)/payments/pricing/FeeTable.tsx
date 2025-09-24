import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FeeStructure } from "./page";

type Service = {
  service_name?: string;
  service_code?: string;
};

export type ServiceMap = Record<string, Service | undefined>;

type Props = {
  fees: FeeStructure[];
  serviceMap: ServiceMap;
  showSpecialCase?: boolean;
};

export default function FeesTable({ fees, serviceMap, showSpecialCase }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[180px]">Service Name</TableHead>
          <TableHead className="min-w-[80px]">Service Code</TableHead>
          <TableHead className="min-w-[120px]">Age Bracket</TableHead>
          <TableHead className="min-w-[80px]">Fee (USD)</TableHead>
          <TableHead className="min-w-[140px]">Description</TableHead>
          {showSpecialCase && <TableHead className="min-w-[110px]">Special Case</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {fees.map((fee) => {
          const svc = serviceMap[fee.service_type_code ?? ""];
          return (
            <TableRow key={fee.id}>
              <TableCell>{svc?.service_name ?? "-"}</TableCell>
              <TableCell>{svc?.service_code ?? "-"}</TableCell>
              <TableCell>{fee.age_bracket_display}</TableCell>
              <TableCell>${fee.fee_amount_usd}</TableCell>
              <TableCell>{fee.description || "-"}</TableCell>
              {showSpecialCase && <TableCell>{fee.special_case || "-"}</TableCell>}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}