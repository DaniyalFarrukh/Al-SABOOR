import type { Metadata, Viewport } from "next";
import { getStoreSettings } from '@/lib/actions/settings'
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings()
  const storeName = settings?.general?.store_name || "Al Saboor Autos"
  const defaultDesc = "Pakistan's premium motorcycle parts and accessories platform."

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      template: `%s | ${storeName}`,
      default: `${storeName} | Premium Motorcycle Parts`,
    },
    description: defaultDesc,
    openGraph: {
      title: storeName,
      description: defaultDesc,
      type: 'website',
      siteName: storeName,
    },
    twitter: {
      card: 'summary_large_image',
    }
  }
}

export const viewport: Viewport = {
  themeColor: '#d9232d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents auto-zoom on input focus on iOS
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings()
  const storeName = settings?.general?.store_name || "Al Saboor Autos"

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": storeName,
    "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": settings?.general?.contact_number || "",
      "contactType": "customer service"
    }
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
