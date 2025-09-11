import React, { Suspense } from "react";
import CallbackClient from "@/components/auth/callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p>Signing you in...</p>}>
      <CallbackClient />
    </Suspense>
  );
}
