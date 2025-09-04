export type DbSchema = {
  Cases: Case[];

  Payments: Payment[];
};



type Case = {
    id: string;
    user_created: string | null;
    date_created: string;
    user_updated: string | null;
    date_updated: string | null;

    case_management_system: number | null;
    main_client: string | null;

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
  }


  type Payment = {
    id: string;
    user_created: string | null;
    date_created: string;
    user_updated: string | null;
    date_updated: string | null;

    case_id: string | null; // FK to cases
    amount_in_dollar: number | string | null;
    amount_in_local_currency: number | string | null;

    type_of_payment: number | null;
    date_of_payment: string | null; // ISO date
    transaction_id: string | null;
    status: number | null;

    wave: string | null;
    Business_Unit_Name_: string | null;
    Percent: number | string | null;
    Line_Transactions_Flexfield_Context: string | null;
    validationTraceId: string | null;
    payerInfo: string | null;
    qr_string: string | null;
    qr_timestamp: string | null;
    paidAmount: number | string | null;
  };