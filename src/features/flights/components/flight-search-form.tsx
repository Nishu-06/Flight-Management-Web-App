"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { searchSchema, type SearchInput } from "@/lib/validations";
import { useFlightStore } from "@/stores/use-flight-store";
import { airports } from "@/features/flights/constants";

export function FlightSearchForm({
  onSearch
}: {
  onSearch: (query: SearchInput) => Promise<void>;
}) {
  const savedQuery = useFlightStore((state) => state.searchQuery);
  const setSearchQuery = useFlightStore((state) => state.setSearchQuery);
  const today = new Date().toISOString().slice(0, 10);
  const defaultQuery: SearchInput = useMemo(
    () => ({
      origin: "Delhi",
      destination: "Mumbai",
      date: today,
      passengerCount: 1
    }),
    [today]
  );
  const parsedSavedQuery = savedQuery ? searchSchema.safeParse(savedQuery) : null;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SearchInput>({
    resolver: zodResolver(searchSchema),
    defaultValues: parsedSavedQuery?.success ? parsedSavedQuery.data : defaultQuery
  });

  useEffect(() => {
    if (!savedQuery) {
      return;
    }

    const parsed = searchSchema.safeParse(savedQuery);
    if (!parsed.success) {
      setSearchQuery(defaultQuery);
      reset(defaultQuery);
    }
  }, [defaultQuery, reset, savedQuery, setSearchQuery]);

  async function submit(values: SearchInput) {
    setSearchQuery(values);
    await onSearch(values);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="rounded-lg border border-slate-200 bg-white/95 p-4 shadow-panel sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_180px_150px_auto] lg:items-end">
        <Select label="Origin" error={errors.origin?.message} {...register("origin")}>
          {airports.map((airport) => (
            <option key={airport} value={airport}>
              {airport}
            </option>
          ))}
        </Select>
        <Select label="Destination" error={errors.destination?.message} {...register("destination")}>
          {airports.map((airport) => (
            <option key={airport} value={airport}>
              {airport}
            </option>
          ))}
        </Select>
        <Input label="Date" type="date" min={today} error={errors.date?.message} {...register("date")} />
        <Input
          label="Passengers"
          type="number"
          min={1}
          max={6}
          error={errors.passengerCount?.message}
          {...register("passengerCount")}
        />
        <Button type="submit" className="h-11 lg:px-5" disabled={isSubmitting}>
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  );
}
