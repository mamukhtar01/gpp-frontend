import Image from "next/image"

import  LoginForm  from "@/components/login-form"

export default async function LoginPage() {

    
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="">
             {/* add logo */}
             <Image src="/iom-logo.svg" alt="" width={100} height={47} />
             
            </div>
           <h1 className="text-2xl font-bold">IOM Payment Platform</h1>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image
         width={200}
         height={400}
          src="/login-bg.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.9] "
        />
      </div>
    </div>
  )
}
