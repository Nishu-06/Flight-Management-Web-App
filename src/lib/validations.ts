import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const searchSchema = z.object({
  origin: z.string().min(2, "Choose an origin"),
  destination: z.string().min(2, "Choose a destination"),
  date: z.string().min(1, "Choose a departure date"),
  passengerCount: z.coerce.number().int().min(1).max(6)
}).refine((value) => value.origin !== value.destination, {
  message: "Origin and destination must be different",
  path: ["destination"]
});

export const passengerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  passportNo: z.string().min(5, "Passport number must be at least 5 characters"),
  nationality: z.string().min(2, "Nationality is required"),
  dob: z.string().min(1, "Date of birth is required")
});

export const bookingSchema = z.object({
  passengers: z.array(passengerSchema).min(1).max(6)
});

export type AuthInput = z.infer<typeof authSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
