"use client";

import { XCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { TTxnReportResponseFailure } from "@/app/types";
import { QRCodeSVG } from "qrcode.react";
import { TPayment } from "@/lib/schema";
import { formatCurrency } from "@/lib/fee-utils";

export function TransactionNotCompleted({
  transactionReport,
  payment,
}: {
  transactionReport: TTxnReportResponseFailure;
  payment: TPayment;
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-muted px-4 py-20">
      <Card className="max-w-3xl w-full p-8 shadow-xl border border-border bg-white">
        <CardHeader className="flex flex-col items-center gap-4">
          <XCircle className="h-20 w-20 text-yellow-500 mb-2" />
          <CardTitle className="text-3xl font-bold text-yellow-600">
            Payment Not Initiated
          </CardTitle>
          <p className="text-base text-muted-foreground text-center mt-2">
            {transactionReport.responseDescription ??
              "Your transaction could not be completed."}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 mt-6">
          <div>
            <Separator className="my-4" />
            <p className="text-base text-muted-foreground text-center mb-4">
              Please check payment details and try again.
            </p>
            <Separator className="my-8" />
            <Button
              variant="outline"
              className="w-full text-lg py-3"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>

          {payment.qr_string && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  className="w-full mt-4 text-base py-3"
                >
                  View QRCODE TO PAY
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                className="w-[600px] flex flex-col items-center bg-background border border-border shadow-lg p-8"
              >
                <div className="mb-4 font-semibold text-xl text-center text-foreground">
                  Payment QR Code
                </div>
                <div className="mb-4 flex justify-center">
                  <QRCodeSVG value={payment.qr_string} size={340} />
                </div>
                <div className="text-sm text-muted-foreground text-center space-y-2">
                  <div>
                    Amount Local:{" "}
                    <strong>
                      {formatCurrency(payment.amount_in_local_currency || 0, "NPR")}
                    </strong>
                  </div>
                  <div>
                    Amount USD:{" "}
                    <strong>
                      {formatCurrency(payment.amount_in_dollar || 0, "USD")}
                    </strong>
                  </div>
                  <div>
                    Client:{" "}
                    <strong>
                      {payment.payerInfo}
                    </strong>
                  </div>
                  <div>
                    Description:{" "}
                    <span>
                      {transactionReport.responseDescription ||
                        "Payment details"}
                    </span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </CardContent>
      </Card>
    </div>
  );
}