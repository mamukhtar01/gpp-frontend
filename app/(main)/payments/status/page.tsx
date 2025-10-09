export const dynamic = "force-dynamic"; // update data on every request

import { getPaymentsAction } from "@/app/server_actions";
import { columns } from "./columns";
import { DataTable } from "./table";
import { TPayment } from "@/lib/schema";


export default async function PaymentStatus() {

    // fetch payment data

const payments =  await getPaymentsAction() as TPayment[] | null;


if (!payments) {
    return <div>No payments found.</div>;
}

// ensure we pass an array to DataTable

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
      <DataTable data={payments} columns={columns} />
    </div>
  );
}
