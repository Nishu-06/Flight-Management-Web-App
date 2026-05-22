"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Flight, FlightSearchQuery, Seat } from "@/types/domain";

type BookingStep = "search" | "seat" | "passenger" | "confirmation";

type FlightStore = {
  searchQuery: FlightSearchQuery | null;
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  bookingStep: BookingStep;
  optimisticSeatIds: string[];
  setSearchQuery: (query: FlightSearchQuery) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setBookingStep: (step: BookingStep) => void;
  markSeatOptimistic: (seatId: string) => void;
  clearOptimisticSeat: (seatId: string) => void;
  resetBookingFlow: () => void;
};

const initialState = {
  searchQuery: null,
  selectedFlight: null,
  selectedSeat: null,
  bookingStep: "search" as BookingStep,
  optimisticSeatIds: []
};

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedFlight: (selectedFlight) =>
        set({ selectedFlight, selectedSeat: null, bookingStep: selectedFlight ? "seat" : "search" }),
      setSelectedSeat: (selectedSeat) => set({ selectedSeat, bookingStep: selectedSeat ? "passenger" : "seat" }),
      setBookingStep: (bookingStep) => set({ bookingStep }),
      markSeatOptimistic: (seatId) =>
        set((state) => ({ optimisticSeatIds: [...new Set([...state.optimisticSeatIds, seatId])] })),
      clearOptimisticSeat: (seatId) =>
        set((state) => ({ optimisticSeatIds: state.optimisticSeatIds.filter((id) => id !== seatId) })),
      resetBookingFlow: () => set(initialState)
    }),
    {
      name: "aerodesk-flight-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        bookingStep: state.bookingStep
      })
    }
  )
);
