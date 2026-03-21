import type { Metadata } from "next";
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Roli - Csontkovács és Manuálterápia | Józsa",
  description:
    "Roli csontkovács Józsán – fájdalommentes élet derék-, nyak- és ízületi panaszok esetén. Foglalj időpontot online!",
  keywords: ["csontkovács", "józsa", "manuálterápia", "derékfájás", "nyakfájás", "gerinc"],
  authors: [{ name: "Roli Csontkovács" }],
  openGraph: {
    title: "Roli - Csontkovács és Manuálterápia | Józsa",
    description:
      "Fájdalommentes élet – derék-, nyak- és ízületi panaszok kezelése Józsán. Foglalj időpontot!",
    url: "https://rolicsontkovacs.hu",
    siteName: "Roli Csontkovács",
    locale: "hu_HU",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Roli Csontkovács",
  description: "Csontkovács és manuálterapeuta Józsán",
  url: "https://rolicsontkovacs.hu",
  telephone: "+36301234567",
  email: "roli@rolicsontkovacs.hu",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Példa utca 1.",
    addressLocality: "Debrecen-Józsa",
    postalCode: "4225",
    addressCountry: "HU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 47.6333,
    longitude: 21.6167,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
  priceRange: "$$",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${montserrat.variable} ${roboto.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
