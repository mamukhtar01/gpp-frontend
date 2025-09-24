"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { TUKTB_Cases } from "@/lib/schema";






export  function SearchUKTBCombobox({ setSelectedCase }: { setSelectedCase: (c: TUKTB_Cases | null) => void }) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [cases, setCases] = React.useState<TUKTB_Cases[]>([])
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(false)



  // replaced fetchCases + effect with a debounced search effect

  React.useEffect(() => {
    const controller = new AbortController()

    if (search === "") {
      setCases([])
      setLoading(false)
      return
    }

    setLoading(true)

    const debounce = setTimeout(async () => {

     
      try {
        const res = await fetch(`/api/cases/uktb?search=${encodeURIComponent(search)}`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          setCases([])
          return
        }
        const data = await res.json()
        setCases(data)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return
        console.error("Failed to fetch cases:", err)
        setCases([])
      } finally {
        setLoading(false)
      }
    }, 300) // debounce delay in ms

    return () => {
      controller.abort()
      clearTimeout(debounce)
      setLoading(false)
    }
  }, [search])





  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[400px] justify-between"
        >
          {value
            ? cases.find((caseItem) => caseItem.id === value)?.id
            : "Search Case Number..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-gray-100 text-gray-800">
        <Command>
          <CommandInput
            placeholder="Search Case Number..."
            className="h-12"
            value={search}
            onValueChange={(val: string) => setSearch(val)}
            // onChange fallback removed; shadcn CommandInput uses onValueChange
          />
          <CommandList className="max-h-100 min-h-24">
            {loading && (
              <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Searching...</span>
              </div>
            )}

            {!loading && cases.length === 0 && <CommandEmpty>No case found.</CommandEmpty>}

            <CommandGroup>
              {cases.map((caseItem) => (
                <CommandItem
                  key={caseItem.id}
                  value={caseItem.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    const selected = cases.find((c) => c.id === currentValue) || null
                    setSelectedCase(selected)
                    setOpen(false)
                  }}
                >
                  {caseItem.id}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === caseItem.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
