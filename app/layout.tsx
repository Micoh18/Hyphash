import type { Metadata } from "next";
import { WalletProvider } from "@/hooks/useWallet";
import { ObservationsProvider } from "@/hooks/useObservations";
import { I18nProvider } from "@/hooks/useI18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mycelium — Fungi Knowledge Network",
  description:
    "A community-driven interactive map where people document fungi they find in the wild.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="antialiased">
        <I18nProvider>
          <WalletProvider>
            <ObservationsProvider>
              {children}
            </ObservationsProvider>
          </WalletProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
