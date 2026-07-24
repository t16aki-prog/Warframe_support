import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TennoNavi - Warframe Support",
  description: "Warframe Helper App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
