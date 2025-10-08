"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function GoBackBtn({
  className,
  variant,
}: {
  className?: string;
  variant?: "outline" | "default" | "ghost" | "link" | "destructive";
}) {
  const router = useRouter();
  return (
    <div className={className}>
      <Button
        onClick={() => router.back()}
        className={`text-sm text-gray-600  hover:cursor-pointer hover:bg-gray-100 font-medium`}
        variant={variant || "default"}
      >
        Go Back
      </Button>
    </div>
  );
}
