import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../lib/error-handler";
import CSSLogger from "@/components/utils/css-logger";
import { Toaster } from "@/components/ui/feedback/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CommandPaletteProvider } from "@/components/providers/command-palette-provider";
import { FloatingSearchButton } from "@/components/ui/navigation/floating-search-button";
import { ConditionalFloatingSearchButton } from "@/components/ui/navigation/conditional-floating-search-button";
import SWRProvider from "@/providers/swr-provider";
import { getCommandPaletteInitialData } from "@/lib/actions/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Core",
  description: "Core",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
      {
        rel: "msapplication-config",
        url: "/browserconfig.xml",
      },
    ],
  },
  appleWebApp: {
    title: "Core",
    statusBarStyle: "default",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d6f249",
};

export const dynamic = "force-dynamic";

// Server component
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const commandPaletteData = await getCommandPaletteInitialData();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var c = localStorage.getItem('accent-color');
              if (c) document.documentElement.style.setProperty('--accent-color', c);
            } catch(e) {}
          })();
        `}} />
        <style>{`
          /* Override table border styles */
          tr, td, th {
            border-color: #e5e5e5 !important;
          }
          tbody, thead, tfoot {
            background-color: transparent !important;
          }
          /* Make sure our styles have higher specificity */
          body table tr {
            border-color: #e5e5e5 !important;
          }

          /* Dark mode specific table styles */
          html.dark tr, 
          html.dark td, 
          html.dark th {
            border-color: #262626 !important;
          }
          html.dark body table tr {
            border-color: #262626 !important;
          }
          html.dark table {
            border-color: #262626 !important;
          }
          html.dark table tbody {
            border-color: #262626 !important;
          }
        `}</style>
      </head>
      <body className="bg-background text-foreground antialiased overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-[var(--primary)] focus:text-[var(--primary-foreground)]"
        >
          Skip to content
        </a>
        <NuqsAdapter>
          <ThemeProvider>
            <SWRProvider>
              <CommandPaletteProvider initialData={commandPaletteData}>
                <CSSLogger />
                <div className="min-h-screen w-full overflow-x-hidden">
                  {children}
                </div>
                <Toaster />
                <ConditionalFloatingSearchButton />
              </CommandPaletteProvider>
            </SWRProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
