"use client"

import * as React from "react"
import { Check, ListPlusIcon, X } from "lucide-react"

import { CalculateAge, cn, getFeeByAge } from "@/lib/utils"
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

import { TUKTB_Cases } from "@/lib/schema"
import { FeeStructure } from "@/app/types"

export function SearchUKTBCombobox({
  setSelectedCase,
  setUkCases,
  ukFees,
}: {
  setSelectedCase: (c: TUKTB_Cases | null) => void
  setUkCases: React.Dispatch<React.SetStateAction<TUKTB_Cases[]>>
  ukFees: FeeStructure[]
}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [cases, setCases] = React.useState<(TUKTB_Cases & { age: number })[]>([])
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  // cache for search results
  const cache = React.useRef<Record<string, (TUKTB_Cases & { age: number })[]>>({})

  React.useEffect(() => {
    const controller = new AbortController()

    // empty input: reset
    if (search.trim() === "") {
      setCases([])
      setLoading(false)
      return
    }

    // cached results: instant return
    if (cache.current[search]) {
      setCases(cache.current[search])
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
        const data: TUKTB_Cases[] = await res.json()

        // precompute ages once
        const enriched = data.map((c) => ({
          ...c,
          age: CalculateAge(c.date_of_birth) ?? 0,
        }))

        // cache results
        cache.current[search] = enriched
        setCases(enriched)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return
        console.error("Failed to fetch cases:", err)
        setCases([])
      } finally {
        setLoading(false)
      }
    }, 300) // debounce delay

    return () => {
      controller.abort()
      clearTimeout(debounce)      
    }
  }, [search])

  function handleCaseSelect(c: TUKTB_Cases & { age: number }) {
    const fee = getFeeByAge(ukFees, c.age)
    const newCase = { ...c, amount: fee ? `$${fee.toFixed(2)}` : "$0.00" }

    setUkCases((prev) => {
      if (prev.find((x) => x.id === newCase.id)) return prev
      return [...prev, newCase]
    })
    setSelectedCase(newCase)
  }

  function clearSearch() {
    setSearch("")
    setCases([])
    setValue("")
  }

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
          <div className="flex items-center gap-2">
            <span>Add Case</span>
            <ListPlusIcon className="opacity-50 " />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-gray-100 text-gray-800">
        <Command>
          <div className="flex items-center">
            <CommandInput
              placeholder="Search Case Number..."
              className="h-12 flex-1"
              value={search}
              onValueChange={(val: string) => setSearch(val)}
            />
            {search && (
              <button
                aria-label="Clear search"
                onClick={clearSearch}
                className="p-2 text-gray-500 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <CommandList className="max-h-100 min-h-24">
            {loading && (
              <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Searching...</span>
              </div>
            )}

            {!loading && cases.length === 0 && (
              <CommandEmpty>No case found.</CommandEmpty>
            )}

            <CommandGroup>
              {cases.map((caseItem) => (
                <CommandItem
                  key={caseItem.id}
                  value={caseItem.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    handleCaseSelect(caseItem)
                    setOpen(false)
                  }}
                >
                  {caseItem.id} –
                  <span className="text-xs font-light">
                    {" "}
                    {caseItem.First_Name}
                  </span>{" "}
                  –{" "}
                  <span className="text-xs font-light">{caseItem.age} yrs</span>
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
