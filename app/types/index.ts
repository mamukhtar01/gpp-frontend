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