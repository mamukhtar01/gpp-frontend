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



// userType


export type TUser = {
  id: string
  first_name: string
  last_name: string
  email: string
  password?: string
  location?: string | null
  title?: string | null
  description?: string | null
  tags?: string[] | null
  avatar?: string | null
  language?: string | null
  tfa_secret?: string | null
  status: "active" | "invited" | "suspended"
  role: string // could be UUID or expanded object if you fetch with fields=role.*
  token?: string
  last_access?: string | null // ISO datetime
  last_page?: string | null
  provider?: string | null
  external_identifier?: string | null
  email_notifications?: boolean
  appearance?: string | null
  theme_dark?: string | null
  theme_light?: string | null
  Clinic?: string | null
  Country?: number | null
  policies?: string[]
}
