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
  case_number: string;
  mimosa_case: string;
  case_management_system: number;
  reference: string;
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
export interface TTxnReportResponseSuccess {
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

export type TTxnReportResponseFailure = {
  responseCode: string // e.g. "E012"
  responseDescription: string
  billsPaymentDescription: string | null
  billsPaymentResponseCode: string | null
  fieldErrors: unknown[]
  responseMessage: string | null
}


export type TNewPaymentRecord = { 
  case_number: string;
  mimosa_case: string | null;
  case_management_system: number;
  reference: string | null;
  amount_in_dollar: string;
  amount_in_local_currency: string;
  type_of_payment: number;
  date_of_payment: string; // ISO timestamp
  transaction_id: string;
  status: number;
  validationTraceId: string | null;
  payerInfo: string | null;
  paidAmount: string | null;
  qr_timestamp: string | null;
  qr_string: string | null;
  wave: string | null;
  clinic: number | null;
};


export type FeeStructure = {
  id: number;
  fee_amount_usd: string; // stored as string
  min_age_months: number | null;
  max_age_months: number | null;
};



