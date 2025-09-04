import "server-only";
import client from "@/lib/directus";
import { readMe } from "@directus/sdk";
import { redirect } from "next/navigation";

export async function getUserData() {
  try {
    // read token.json
    const tokenData = await import("@/token.json");
    const token = tokenData.data.access_token;
    //const refreshToken = tokenData.data.refresh_token;


    if (!token) {
      redirect("/login"); // Redirect if unauthorized
    }

    

    client.setToken(token);
    const user = await client.request(readMe());

    return { success: true, user };
  } catch (error) {
    console.log(error);
    redirect("/login"); // Redirect if unauthorized
  }
}


