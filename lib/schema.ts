import { TClientBasicInfo } from "@/app/types";

export type DbSchema = {
  Cases: TCase[];

  Payments: TPayment[];
  Clients: TClient[];
  UKTB_Cases: TUKTB_Cases[];
  directus_users: TUser[];
  directus_roles: TUserRole[];
  Clinic: TClinic[];
  Countries: TCountries[];
  fee_structures: TFeeStructure[];
  service_types: ServiceType[];
};

type TCase = {
  id: string;
  user_created: string | null;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;

  case_management_system: number | null;
  main_client: TClient;

  amount_paid_in_dollar: number | null;
  amount_to_pay_in_dollar: number | null;
  local_currency: string | null;

  case_status: number | string | null;
  travel_destination_to: string | null;
  travel_destination_from: string | null;

  amount_paid_in_local_currency: number | null;
  amount_to_pay_in_local_currency: number | null;
  exchange_rate: number | null;

  wbs: string | null;
  package_price_in_dollar: number | null;
  package_price: number | null;

  appointment_date: string | null;
  token_value: string | null;
  Clinic: string | null;
  case_id: string | null;
  Case_Consolidation: string | null;

  clients: string[];
  payments: string[];
  additional_services: string[];
};

export type TClient = {
  id: string;
  user_created: string | null;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  passport_number: string | null;
  date_of_birth: string | null;
} | null;

export type TPayment = {
  id: string;
  user_created: string | null;
  date_created: string | null;
  user_updated: string | null;
  date_updated: string | null;

  mimosa_case: string | null; // FK to cases
  case_management_system: number;
  case_number: string;
  reference: string | null;
  amount_in_dollar: number | string | null;
  amount_in_local_currency: number | string | null;

  type_of_payment: number;
  date_of_payment: string; // ISO date
  transaction_id: string | null;
  status: number;

  wave: string | null;
  Business_Unit_Name_: string | null;
  Percent: number | string | null;
  Line_Transactions_Flexfield_Context: string | null;
  validationTraceId: string | null;
  payerInfo: string | null;
  qr_string: string | null;
  qr_timestamp: string | null;
  paidAmount: number | string | null;
  clinic: string | null;
  clients: TClientBasicInfo[] | null; // JSON string of client info
  service_type: string | null; // JSON string of service types
};

export type TUKTB_Cases = {
  id: string;
  visa_type: string;
  native_name: string;
  passport: string;
  exam_date: string;
  First_Name: string;
  Last_Name: string;
  Sex: "Male" | "Female" | string; // restrictable union if needed
  date_of_birth: string; // ISO date string
  telephone: string;
  amount: string; // could be number if numeric
  appointment_date: string; // ISO date string
  appointment_time: string; // HH:mm:ss
  location: string;
  Country: number;
  Currency: number;
  date_created: string; 
};

// userType

export type TUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  location?: string | null;
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  avatar?: string | null;
  language?: string | null;
  tfa_secret?: string | null;
  status: "active" | "invited" | "suspended";
  role: TUserRole | null;
  token?: string;
  last_access?: string | null; // ISO datetime
  last_page?: string | null;
  provider?: string | null;
  external_identifier?: string | null;
  email_notifications?: boolean;
  appearance?: string | null;
  theme_dark?: string | null;
  theme_light?: string | null;
  Clinic?: TClinic | null;
  Country?: TCountries | null;
  policies?: string[];
};

export type TUserRole = {
  id: string;
  name: string;
  description: string | null;
};

export type TClinic = {
  id: string;
  Name: string;
  City: string;
  Country: string;
};

export type TCountries = {
  id: number;
  country: string;
  country_code: string;
  local_currency: string;
};


export interface TFeeStructure {
  id: number;
  sort: number | null;
  user_created: string;
  date_created: string; // ISO date string
  user_updated: string | null;
  date_updated: string | null;
  country_id: number;
  age_bracket_display: string;
  min_age_months: number | null;
  max_age_months: number | null;
  visa_type: string | null;
  special_case: string | null;
  fee_amount_usd: string;
  description: string | null;
  is_active: boolean;
  service_type_code: ServiceType;
}


export type ServiceCategory = "medical_exam" | "vaccination" | "special_service";

export interface ServiceType {
  service_code: string;
  sort: number | null;
  user_created: string;
  date_created: string; // ISO date string
  user_updated: string | null;
  date_updated: string | null;
  service_name: string;
  description: string | null;
  category: ServiceCategory;
  is_active: boolean;
}
