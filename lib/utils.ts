
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TUKTB_Cases } from "./schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Map excel data to UKTB_Cases type with error handling
export function mapToUKTBCases(data: string[][]): TUKTB_Cases[] {
  const results: TUKTB_Cases[] = [];

  // validate data
  if (data.length === 0) throw new Error("Data Mapping: No data provided");
  if (!Array.isArray(data[0])) throw new Error("Data Mapping: Invalid data format");


  data.forEach((item, index) => {
    try {
      if (!Array.isArray(item)) {
        throw new Error(`Row ${index} is not an array`);
      }

      if (item.length < 11) {
        throw new Error(`Row ${index} has insufficient fields (expected 11, got ${item.length})`);
      }

      const [
        , // Skip the first column (serial number)
        id,
        visa_type,
        location,
        appointment_date,
        appointment_time,
        exam_date,
        First_Name,
        Last_Name,
        native_name,
        Sex,
        date_of_birth,
        passport,
        telephone,     
      ] = item;

      if (!id) throw new Error(`Missing id in row ${index}`);
     


  

      results.push({
        id,
        visa_type: visa_type?.trim(),
        native_name: native_name?.trim(),
        exam_date: exam_date?.trim(),
        passport: passport?.trim(),
        First_Name: First_Name?.trim(),
        Last_Name: Last_Name?.trim(),
        Sex: Sex === "M" ? "Male" : Sex === "F" ? "Female" : Sex,
        date_of_birth,
        telephone: telephone?.trim(),
        amount: "1",
        appointment_date,
        appointment_time,
        location,
        Country: 4,
        Currency: 5
      });
    } catch (err) {
      console.error(`❌ Error processing row ${index}:`, (err as Error).message);
      // Skip invalid row instead of crashing
    }
  });

  return results;
}
