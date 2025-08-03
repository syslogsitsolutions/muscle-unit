import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/components/query-provider"; // Import the new provider
import { RouteLoader } from "@/components/RouteLoader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Muscle Unit - Gym Management System",
  description: "A comprehensive gym management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <QueryProvider>
            {" "}
            {/* Wrap ThemeProvider and children */}
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              {/* <RouteLoader /> */}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
