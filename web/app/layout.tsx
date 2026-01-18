import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carsight - True Vehicle Cost Calculator",
  description: "See through the marketing hype. Calculate the real total cost of vehicle ownership.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
