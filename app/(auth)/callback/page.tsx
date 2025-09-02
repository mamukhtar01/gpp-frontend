"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const accessToken = params.get("access_token");
    if (accessToken) {
      // Save token securely (better: httpOnly cookie via API route)
      localStorage.setItem("directus_token", accessToken);

      // Redirect to home
      router.push("/home");
    } else {
      router.push("/login?error=missing_token");
    }
  }, [params, router]);

  return <p>Signing you in...</p>;
}
