import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "EduManage School OS | Premium School Management SaaS",
  description: "EduManage is a secure school operating system for academics, attendance, fees, results, parent communication and executive analytics.",
  applicationName: "EduManage School OS",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "EduManage School OS",
    description: "A premium school operating system for modern institutions.",
    images: [{ url: "/marketing/platform-intelligence.webp", width: 1376, height: 768, alt: "EduManage platform intelligence dashboard" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
