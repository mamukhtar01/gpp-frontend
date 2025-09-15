"use client";
export default function CreditCardPage() {


    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center px-4">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Credit Card Payment Page
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
                This is a placeholder for the credit card payment functionality.
            </p>
            <button
                onClick={
                    () => alert("This is a placeholder action for making a payment.")   
                }
                className="mt-6 rounded-2xl px-6 py-2 bg-blue-500 text-white hover:scale-105 transition-transform hover:cursor-pointer"
            >
                Make Payment
            </button>
        </div>
    );
}