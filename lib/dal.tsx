import "server-only";
import { cookies } from "next/headers";
import client from "@/lib/directus";
import { readMe } from "@directus/sdk";
import { redirect } from "next/navigation";
import { UserData } from "./types";

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
    const user = await client.request(readMe()) as UserData;

    return { success: true, user };
  } catch (error) {
    console.log(error);
    redirect("/login"); // Redirect if unauthorized
  }
}


