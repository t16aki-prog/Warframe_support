import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "猫カフェ・ポモドーロ 🐾",
  description: "限界を超えた集中と癒やしを提供する、究極の猫カフェポモドーロタイマー。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
