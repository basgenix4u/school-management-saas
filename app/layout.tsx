import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduManage SaaS | School Management Platform",
  description: "A full-stack school management SaaS for students, teachers, attendance, results, fees and parent communication.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
