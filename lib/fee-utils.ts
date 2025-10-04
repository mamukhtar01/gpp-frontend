
// Fee calculation utilities based on country and age

// based on US Fee Table

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
  if (age < 5) return 68;
  return 45;
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


