"use client";

import { useEffect } from "react";
import {  useSearchParams } from "next/navigation";

export default function CallbackClient() {
 // const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const accessToken = params.get("access_token");
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
  }, []);

  return <p>Signing you in...</p>;
}
