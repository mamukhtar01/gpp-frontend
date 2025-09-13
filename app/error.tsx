"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Unplug } from "lucide-react"; // icon showing disconnection

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center px-4">
      <Unplug className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Something went wrong!
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn’t connect to the server. Please check your internet connection
        and try again.
      </p>
      <div className="mt-6 flex space-x-4 justify-between">
        <Button
          onClick={() => (window.location.href = "/")}
          variant="default"
          className="rounded-2xl px-6 hover:scale-105 transition-transform hover:cursor-pointer"
        >
          Home
        </Button>
        <Button
          onClick={reset}
          variant="default"
          className="rounded-2xl px-6 hover:scale-105 transition-transform hover:cursor-pointer"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
