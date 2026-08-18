import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { AppHeader } from "./AppHeader";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "The Compendium",
  description: "A personal, invite-only reference compendium for monsters, items, spells, and rules across your TTRPG systems.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const secret = process.env.SITE_PASSWORD ?? "";
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token, secret) : null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {session && <AppHeader />}
        {children}
      </body>
    </html>
  );
}
