import { PageShell } from "@/components/layout/page-shell";
import { FlightSearchExperience } from "@/features/flights/components/flight-search-experience";

export default function HomePage() {
  return (
    <PageShell>
      <FlightSearchExperience />
    </PageShell>
  );
}
