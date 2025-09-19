import * as React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

export type ExcelData = {
  headers: string[];
  rows: unknown[][];
};

interface DataDisplayProps {
  excelData: ExcelData;
  onReset: () => void;
  onUpload: () => void;
  loading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function UKTBDataDisplay({ excelData, onReset, onUpload, loading, open, setOpen }: DataDisplayProps) {
  const [page, setPage] = React.useState(1);
  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(excelData.rows.length / pageSize));
  const pagedRows = excelData.rows.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    // Reset to first page if data changes
    setPage(1);
  }, [excelData]);

  return (
    <div className="w-full overflow-x-auto border rounded-xl bg-white shadow mb-8 p-6">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            {excelData.headers.map((header, idx) => (
              <TableHead
                key={idx}
                className="bg-gray-100 text-gray-800 font-semibold text-base px-6 py-3 border-b border-gray-200 uppercase tracking-wide text-center"
                style={{ minWidth: 100 }}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedRows.map((row, i) => (
            <TableRow key={i} className="hover:bg-gray-50">
              {excelData.headers.map((_, j) => (
                <TableCell
                  key={j}
                  className="px-6 py-2 whitespace-nowrap text-sm border-b border-gray-100 text-center"
                  style={{ minWidth: 100 }}
                >
                  {String(row[j] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
        <span className="text-sm text-gray-600">Rows : <span className="font-semibold">{excelData.rows.length}</span></span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <div className="text-sm">{page} / {totalPages}</div>
          <Button variant="ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          <Button variant="outline" onClick={onReset}>Reset & Re-upload</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="" disabled={loading}>Confirm & Upload</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Upload</DialogTitle>
              </DialogHeader>
              <div className="py-2 text-gray-700">
                Are you sure you want to upload <span className="font-semibold">{excelData.rows.length}</span> cases to the database?
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={async () => { setOpen(false); onUpload(); }} disabled={loading}>Yes, Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
