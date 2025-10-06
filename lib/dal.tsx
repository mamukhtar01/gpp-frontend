//import "server-only";
import client from "@/lib/directus";
import { readMe } from "@directus/sdk";
import { redirect } from "next/navigation";

export async function getUserData() {
  try {
    const user = await client.request(
      readMe({
        fields: [
          "id",
          "email",
          "first_name",
          "last_name",
          "status",
          {
            role: ["id", "name", "description"],
          },
          {
            Clinic: ["id", "Name", "City", "Country"],
          },
          {
            Country: ["id", "country", "country_code", "local_currency"],
          },
        ],
      })
    );

    if (!user) {
      throw new Error("No user data returned");
    }

    return { success: true, user };
  } catch (error) {
    console.log(error);
    redirect("/login"); // Redirect if unauthorized
  }
}
