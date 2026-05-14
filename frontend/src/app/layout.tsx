import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatAgent Workspace",
  description: "AI-powered collaborative workspace with MS Office-like experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
