"use server";
// Get UK fee structures and service types from Directus

import client from "@/lib/directus";
import { readItems } from "@directus/sdk";

// Pricing Actions

export async function getServiceTypes() {
  try {
    const data = await client.request(
      readItems("service_types", {
        fields: ["*"],
        sort: ["service_code"],
      })
    );
    return data ?? null;
  } catch (error) {
    console.error("Error fetching service types:", error);
    throw new Error("Failed to fetch service types");
  }
}

// Pricing Actions
export async function getFeeStructures({
  countryCode,
  type,
}: {
  countryCode: number;
  type: "medical_exam" | "vaccination" | "special_service";
}) {
  try {
    const data = await client.request(
      readItems("fee_structures", {
        fields: [
          "id",
          "fee_amount_usd",
          "min_age_months",
          "max_age_months",
          {
            service_type_code: ["service_code", "category", "service_name"],
          }, // include related category in response
        ],
        filter: {
          country_id: { _eq: countryCode },
          service_type_code: {
            category: { _eq: type },
          },
          is_active: { _eq: true },
        },
        sort: ["min_age_months"],
      })
    );

    return data ?? null;
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    throw new Error("Failed to fetch fee structures");
  }
}

export async function getAllFeeStructures() {
  try {
    const data = await client.request(
      readItems("fee_structures", {
         fields: ["*"],

        sort: ["min_age_months"],
      })
    );

    return data ?? null;
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    throw new Error("Failed to fetch fee structures");
  }
}



// Get Exchange Rate
export async function getExchangeRate({CurrencyId}: {CurrencyId: number}) {
  try {
    const data = await client.request(
      readItems("ExchangeRates", {
        fields: ["*"],
        filter: {
         currency: { _eq: CurrencyId } ,
        },
        limit: 1,
      })
    );

    return data ?? null;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw new Error("Failed to fetch exchange rate");
  }
}
     