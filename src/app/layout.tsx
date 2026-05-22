import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { AppProviders } from "@/providers/app-providers";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "AeroDesk Flight Management",
  description: "Realtime flight booking, seat selection, and booking management.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <SiteHeader />
          <main>{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
