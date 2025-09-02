"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  payerName: z.string().min(3, { message: "Name must be at least 3 characters." }),
  amount: z.string().min(1, { message: "Amount is required." }),
})

export function NepalQrForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payerName: "",
      amount: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
        <FormField
          control={form.control}
          name="payerName"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center justify-center gap-4 p-2 rounded">
              <FormLabel className="col-span-1 text-sm">Payer Name</FormLabel>
              <FormControl className="col-span-2">
                <Input placeholder="Enter payer name" {...field} />
              </FormControl>

              <FormMessage className="col-span-3 pl-1 " />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center gap-2 p-2 rounded">
              <FormLabel className="col-span-1 text-sm">Amount</FormLabel>
              <FormControl className="col-span-2">
                <Input placeholder="Enter amount (e.g. 2500)" {...field} />
              </FormControl>
              <FormMessage className="col-span-3 pl-1" />
              
            </FormItem>
          )}
        />

        <Button className="px-4 py-2 rounded bg-black text-white" type="submit">Generate QR Code</Button>
      </form>
    </Form>
  )
}