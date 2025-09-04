export type PaymentRecord = {
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
