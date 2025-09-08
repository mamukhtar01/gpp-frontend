"use client";

import {  XCircle } from "lucide-react"
import {  CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button";



import {  TTxnReportResponseFailure } from "@/app/types";

export function TransactionNotCompleted({ transactionReport }: { transactionReport: TTxnReportResponseFailure }) {
  return (
     <div className="flex flex-col items-center justify-center bg-gray-50 p-6">
            {/* ❌ FAILURE CASE */}
            <CardHeader className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-yellow-500" />
              <CardTitle className="mt-2 text-2xl font-bold text-yellow-600">
                Payment Not Initiated
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {transactionReport.responseDescription ??
                  "Your transaction could not be completed."}
              </p>
            </CardHeader>
            <CardContent>
              <Separator className="my-3" />
              <p className="text-sm text-gray-500 mt-1">
                Please check payment details and try again.
              </p>
              <Separator className="my-8" />
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full hover:cursor-pointer hover:bg-gray-200"  >
                Refresh Page
              </Button>
            </CardContent>
          </div>
  )
}

        