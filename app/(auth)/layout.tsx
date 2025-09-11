import React from "react";


type Props = {
  children: React.ReactNode;
};

export default function LoginLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-black">
      <main className=" mx-auto flex-1 w-full">{children}</main>
    </div>
  );
}
