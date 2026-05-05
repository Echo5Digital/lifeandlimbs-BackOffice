import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life and Limbs Foundation — Patient Registration",
  description: "Patient registration system for Life and Limbs Foundation, Kerala",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
