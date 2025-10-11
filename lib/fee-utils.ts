export function getServiceFee(
  data: ServiceRecord[],
  country_id: number,
  age_years: number
): TGetFeeResponse {
  const age_months = age_years * 12;
  
  const record = data.find(record => {
    if (!record.is_active || record.country_id !== country_id || !record.service_type_code) return false;
    const min = record.min_age_months;
    const max = record.max_age_months;

    // Applies to all ages if both min and max are null/0
    const appliesToAllAges =
      (min === null || min === 0) && (max === null || max === 0);

    if (appliesToAllAges) return true;
    if ((min !== null && age_months < min)) return false;
    if ((max !== null && age_months > max)) return false;
    return true;
  });

  if (!record || record.service_type_code == null) return null;
  return {
    service_name: record.service_type_code.service_name,
    service_code: record.service_type_code.service_code,
    fee_amount_usd: record.fee_amount_usd,
  };
}

type TGetFeeResponse = { service_code: string; service_name: string; fee_amount_usd: string } | null


type ServiceRecord = {
  country_id: number | null;
  min_age_months: number | null;
  max_age_months: number | null;
  is_active: boolean;
 service_type_code: {
        service_code: string;
        category: string;
        service_name: string;
    }
  fee_amount_usd: string;
};

export function getUSAgeBasedFee(age: number) {
  if (age < 2) return 65;
  if (age >= 2 && age <= 14) return 130;
  if (age >= 15 && age <= 17) return 138;
  if (age >= 18 && age <= 24) return 173;
  if (age >= 25 && age <= 44) return 143;
  return 138; // 45+
}

// UK Fee Table
export function getUKAgeBasedFee(age: number) {
  if (age < 11) return 40;
  return 60;
}

// Japan Fee Table
export function getJapanAgeBasedFee(age: number) {
  if (age < 5) return 45;
  return 68;
}

// Australia Fee Table
export function getAustraliaAgeBasedFee(age: number, specialType?: string) {
  if (specialType === "Aged Visitor") return 44;
  if (specialType === "Health Care Worker") return 49;
  if (age < 2) return 45;
  if (age < 5) return 45;
  if (age < 11) return 45;
  if (age < 15) return 43;
  if (specialType === "Health Care Worker") return 49;
  return 43;
}

// New Zealand Fee Table
export function getNewZealandAgeBasedFee(age: number) {
  if (age < 5) return 40;
  if (age < 11) return 40;
  if (age < 15) return 40;
  return 50;
}

// Canada Fee Table
export function getCanadaAgeBasedFee(age: number) {
  if (age < 2) return 35;
  if (age < 11) return 35;
  if (age < 15) return 40;
  return 40;
}

// Utility to calculate age from BirthDate (YYYY-MM-DD or ISO)
export function calculateAge(birthDate: string) {
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}



export function formatCurrency(
  amount: number | string,
  currency: string = "USD"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return amount.toString();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
