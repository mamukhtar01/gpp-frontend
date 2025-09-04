
"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function GoBackBtn() {
    const router = useRouter();
  return (
     <Button
          onClick={() => router.back()}
          className="text-sm text-gray-600  hover:cursor-pointer"
          variant="outline"
        >
          Go Back
        </Button>
  );
}