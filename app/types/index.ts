export interface TCaseSearchResult {
  case_id: string | null;      
  case_status: number;         
  date_created: string;         
  id: string;                   
  main_client: string;
  package_price: string | null;        
}

export type TNepalQRPayload = {
  pointOfInitialization: number;
  acquirerId: string;
  merchantId: string;
  merchantName: string;
  merchantCategoryCode: number;
  merchantCountry: string;
  merchantCity: string;
  merchantPostalCode: string;
  merchantLanguage: string;
  transactionCurrency: number;
  transactionAmount: string;
  valueOfConvenienceFeeFixed: string;
  billNumber: string;
  referenceLabel: string | null;
  mobileNo: string | null;
  storeLabel: string;
  terminalLabel: string;
  purposeOfTransaction: string;
  additionalConsumerDataRequest: string | null;
  loyaltyNumber: string | null;
  token: string;
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