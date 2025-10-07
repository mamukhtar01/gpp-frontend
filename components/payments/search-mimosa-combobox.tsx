"use client";

import * as React from "react";
import { Check, ChevronsUpDown, RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Types based on your given API response
export type CaseMember = {
  CaseMemberID: number;
  CaseNo: string;
  RelationtoPA: string;
  FullName: string;
  Age: number;
  AgeInYears: number;
  AgeInMonths: number;
  AgeInDays: number;
  BirthDate: string;
  Gender: string;
  LastName: string;
  FirstName: string;
  TravelRequirement: string;
  IsLoanRecipient: boolean;
  IsRegisteredByEMedical: boolean;
  TotalCosts: number;
  DateOfReturn: { ["xsi:nil"]: string } | string | null;
};

export type CaseMemberSummaryResponse = {
  Errors: string;
  Warnings: string;
  CaseMemberSummary: {
    CaseMemberSummary: CaseMember[];
  };
  CaseSize: number;
};

export function CaseMemberSummarySearch({
  setSelectedSummary,
}: {
  setSelectedSummary: (c: CaseMember[] | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<CaseMember[] | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    setSummary(null);
    setSelectedSummary(null);
    try {
      const res = await fetch("/api/soap/case_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CaseNo: input.trim() }),
      });
      const data: CaseMemberSummaryResponse = await res.json();
      console.log("Fetched case member summary:", data);
      if (!res.ok || !data?.CaseMemberSummary?.CaseMemberSummary?.length) {
        throw new Error(
          data?.Errors || data?.Warnings || "No case members found"
        );
      }
      setSummary(data.CaseMemberSummary.CaseMemberSummary);
      setSelectedSummary(data.CaseMemberSummary.CaseMemberSummary);
      setOpen(false);
    } catch (err: unknown) {
      setError((err as Error).message);
      setSummary(null);
      setSelectedSummary(null);
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setInput("");
    setError(null);
    setSummary(null);
    setSelectedSummary(null);
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
          {summary
            ? summary[0]?.CaseNo
            : "Search Case Number..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-gray-100 text-gray-800">
        <form onSubmit={handleSearch} className="flex gap-2 p-3">
          <Input
            placeholder="Enter Full Case Number"
            className="h-12 flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            autoFocus
            maxLength={32}
          />
          <Button
            type="submit"
            className="h-12"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            ) : (
              <Search className="w-5 h-5 mr-2" />
            )}
            Search
          </Button>
          <Button type="button" variant="ghost" onClick={onReset} className="h-12">
            Reset
          </Button>
        </form>
        <Command>
          <CommandList>
            {loading && (
              <div className="px-3 py-2 text-sm flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Loading...</span>
              </div>
            )}
            {error && !loading && (
              <div className="px-3 py-2 flex items-center gap-2 text-red-600 bg-red-50 rounded">
                <span>{error}</span>
                <Button size="sm" variant="ghost" onClick={handleSearch}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </div>
            )}
            {!loading && !error && summary && summary.length > 0 && (
              <CommandGroup>
                {summary.map((member) => (
                  <CommandItem
                    key={member.CaseMemberID}
                    value={member.CaseMemberID.toString()}
                    onSelect={() => {
                      setSelectedSummary([member]);
                      setOpen(false);
                    }}
                  >
                    <span>
                      {member.FullName} ({member.RelationtoPA}) — {member.BirthDate?.slice(0, 10)}
                    </span>
                    <Check className={cn("ml-auto", "opacity-100")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!loading && !error && !summary && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Enter a Case Number and click Search.
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}