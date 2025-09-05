export interface TCaseSearchResult {
  case_id: string | null;
  case_status: number;
  date_created: string;
  id: string;
  main_client: string;
  package_price: string | null;
}


// Nepal Transaction Report Payload and Response Types

export type TNepalTxnVerifyPayload = {
  validationTraceId: string;
  merchantId: string;
  acquirerId: string;
}





export type TNepalQRPayload = {
  transactionCurrency: number;
  transactionAmount: number;
  billNumber: string;
  referenceLabel: string | null;
  mobileNo: string | null;
  storeLabel: string;
  terminalLabel: string;
  purposeOfTransaction: string;
};

export type TNepalQRResponse = {
  timestamp: string;
  responseCode: string;
  responseStatus: string;
  responseMessage: string;
  data: {
    qrString: string;
    validationTraceId: string;
  };
};

export type TPaymentPayload = {
  case_id: string;
  amount_in_dollar: string;
  amount_in_local_currency: string;
  type_of_payment: number;
  date_of_payment: string;
  transaction_id: string;
  status: number;
  validationTraceId: string;
  payerInfo: string;
  qr_timestamp: string;
  paidAmount: string;
  qr_string: string;
};



// Root response type
export interface TTxnReportResponse {
  timestamp: string;
  responseCode: string;
  responseStatus: string;
  responseMessage: string | null;
  responseBody: TTxnReportBody[];
}

// Transaction type
export interface TTxnReportBody {
  sessionSrlNo: string;
  recDate: string;
  instructionId: string;
  nQrTxnId: string;
  acquirerId: string;
  issuerId: string;
  network: string;
  issuerNetwork: string;
  amount: number;
  interchangeFee: number;
  transactionFee: number;
  debitStatus: string;
  creditStatus: string;
  payerName: string;
  tranType: string;
  payerMobileNumber: string;
  merchantName: string;
  merchantTxnRef: string;
  terminal: string;
  merchantBillNo: string;
  instrument: string;
  validationTraceId: string;
  merchantPan: string;
  nfcTxnId: string | null;
  storeLabel: string;
  localTransactionDateTime: string;
  addenda1: string | null;
  addenda2: string | null;
  addenda3: string | null;
  addenda4: string | null;
}


export type TPaymentRecord = {
  id: string;
  user_created: string;
  date_created: string; // ISO timestamp
  user_updated: string;
  date_updated: string; // ISO timestamp
  case_id: string;
  amount_in_dollar: string;
  amount_in_local_currency: string;
  type_of_payment: number;
  date_of_payment: string; // ISO timestamp
  transaction_id: string;
  status: number;
  wave: string | null;
  Business_Unit_Name_: string | null;
  Percent: string | null;
  Line_Transactions_Flexfield_Context: string | null;
  validationTraceId: string | null;
  transactionId: string | null;
  payerInfo: string | null;
  paidAmount: string | null;
};
