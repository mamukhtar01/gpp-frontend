import Image from "next/image"
import LoginForm from "@/components/custom/login-form"

export default async function LoginPage() {
  return (
    <div
      className="grid lg:[grid-template-columns:1fr_1px_1fr]"
    >
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div>
              <Image src="/iom-logo.svg" alt="IOM logo" width={100} height={47} />
            </div>
            <h1 className="text-2xl font-bold">IOM Payment Platform</h1>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center min-h-[50vh]">
          <div className="w-full max-w-xs">
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
          height:
            "calc(-125px + 115vh)", // Adjust 190px based on your header + footer heights
        }}
      >
        <Image
          src="/login-bg.jpg"
          alt="Login background"                 
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}
