import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Dialogue Spark Viz",
  description: "AI Voice Agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
