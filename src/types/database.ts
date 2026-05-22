import type { BookingStatus, FlightStatus, SeatClass } from "@/types/domain";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      flights: {
        Row: {
          id: string;
          flight_no: string;
          origin: string;
          destination: string;
          departs_at: string;
          arrives_at: string;
          aircraft_type: string;
          status: FlightStatus;
          base_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          flight_no: string;
          origin: string;
          destination: string;
          departs_at: string;
          arrives_at: string;
          aircraft_type: string;
          status?: FlightStatus;
          base_price: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["flights"]["Insert"]>;
        Relationships: [];
      };
      seats: {
        Row: {
          id: string;
          flight_id: string;
          seat_number: string;
          class: SeatClass;
          is_available: boolean;
          extra_fee: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          flight_id: string;
          seat_number: string;
          class: SeatClass;
          is_available?: boolean;
          extra_fee?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["seats"]["Insert"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          flight_id: string;
          seat_id: string;
          status: BookingStatus;
          booked_at: string;
          total_price: number;
          pnr_code: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          flight_id: string;
          seat_id: string;
          status?: BookingStatus;
          booked_at?: string;
          total_price: number;
          pnr_code?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [];
      };
      passengers: {
        Row: {
          id: string;
          booking_id: string;
          full_name: string;
          passport_no: string;
          nationality: string;
          dob: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          full_name: string;
          passport_no: string;
          nationality: string;
          dob: string;
        };
        Update: Partial<Database["public"]["Tables"]["passengers"]["Insert"]>;
        Relationships: [];
      };
      reschedules: {
        Row: {
          id: string;
          booking_id: string;
          old_flight_id: string;
          new_flight_id: string;
          requested_at: string;
          fee_charged: number;
        };
        Insert: {
          id?: string;
          booking_id: string;
          old_flight_id: string;
          new_flight_id: string;
          requested_at?: string;
          fee_charged: number;
        };
        Update: Partial<Database["public"]["Tables"]["reschedules"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      book_seat: {
        Args: {
          p_flight_id: string;
          p_seat_id: string;
          p_passengers: Json;
        };
        Returns: {
          booking_id: string;
          pnr_code: string;
          total_price: number;
        }[];
      };
      cancel_booking: {
        Args: {
          p_booking_id: string;
        };
        Returns: {
          booking_id: string;
          released_seat_id: string;
        }[];
      };
      reschedule_booking: {
        Args: {
          p_booking_id: string;
          p_new_flight_id: string;
          p_new_seat_id: string;
        };
        Returns: {
          booking_id: string;
          new_pnr_code: string;
          fee_charged: number;
        }[];
      };
    };
    Enums: {
      flight_status: FlightStatus;
      seat_class: SeatClass;
      booking_status: BookingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
