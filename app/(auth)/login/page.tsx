import Image from "next/image";
import LoginForm from "@/components/custom/login-form";

export default async function LoginPage() {
  return (
    <div className="grid lg:[grid-template-columns:1fr_1px_1fr]">
      <div className="flex flex-col ">
        <div className="flex flex-1 flex-col items-center justify-center min-h-[50vh]">
          <div className="">
            <Image
              src="/logo-blue.png"
              alt="Global Payment Platform"
              width={300}
              height={100}  
              className="object-cover"
              priority
            />
          </div>
          <div className="w-full flex justify-center max-w-xs mt-4">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* separator between columns */}
      <div className="hidden lg:block bg-gray-200 w-px h-full" />

      {/* Right column: uses computed height so it never grows beyond available space */}
      <div
        className="relative hidden lg:block w-full overflow-hidden"
        style={{
          height: "calc(-125px + 115vh)", // Adjust 190px based on your header + footer heights
        }}
      >
        <Image
          src="/bg-vertical.png"
          alt="Global Payment Platform"
          width={600}
          height={1000}
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
