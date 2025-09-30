"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import React  from "react";
import client from "@/lib/directus";
import { readMe } from "@directus/sdk";


export default function AuthCallbackPage() {
const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const accessToken = params.get("access_token");
// fetch user info
    const fetchUserInfo = async () => {
      try {
        const response = await client.request(readMe());
        console.log("User info:", response);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
 
    if (accessToken) {
      // Save token securely (better: httpOnly cookie via API route)
      localStorage.setItem("directus_token", accessToken);

      console.log("Access token saved:", accessToken);

      // Redirect to home
     // router.push("/home");
    } else {
      //router.push("/login?error=missing_token");
    }
    // We intentionally only run this once on mount; params is stable for this route.
    // eslint-disable-next-line react-hooks/exhaustive-deps

    fetchUserInfo();
  }, []);

  return <p>Signing you in...</p>;
}
